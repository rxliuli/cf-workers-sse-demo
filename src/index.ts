import { Hono } from 'hono'
import { streamSSE, streamText } from 'hono/streaming'

const app = new Hono()

app.get('/', async (c) => {
  const resp = await fetch('http://localhost:8787/stream', {
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  })
  if (!resp.ok || !resp.body) {
    return c.text('Error', 500)
  }
  const reader = resp.body.pipeThrough(new TextDecoderStream()).getReader()
  return streamText(c, async (stream) => {
    let chunk = await reader.read()
    while (!chunk.done) {
      console.log('chunk: ', chunk.value)
      stream.writeln(chunk.value)
      chunk = await reader.read()
    }
  })
})

app.get('/stream', (c) => {
  return streamSSE(c, async (stream) => {
    for (let i = 0; i < 2; i++) {
      await stream.writeSSE({
        event: 'text',
        data: JSON.stringify({ text: 'Hello Hono ' + i }),
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  })
})

export default app
