import type { GeminiResponse, Pagina } from '../types'

// Relative URL — works in dev (proxied by Vite) and production (same domain)
const API_URL = '/api/transcribe'

export async function transcribeImagenes(paginas: Pagina[]): Promise<GeminiResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paginas: paginas.map((p) => ({
        base64: p.base64,
        mediaType: p.mediaType,
      })),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error de conexión con el servidor' }))
    throw new Error(err.error || `Error ${res.status}`)
  }

  return res.json()
}
