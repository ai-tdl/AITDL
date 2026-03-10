// API proxy → forwards all /api/* requests to FastAPI backend on Railway
// next.config.ts rewrites handle this — this file is a fallback handler

export async function GET() {
  return Response.json({ error: 'Use /api/* routes — proxied to FastAPI backend' }, { status: 404 })
}
