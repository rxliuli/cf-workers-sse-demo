import { serve } from '@hono/node-server'
import app from '.'

serve({
  fetch: app.fetch,
  port: 8787,
})
