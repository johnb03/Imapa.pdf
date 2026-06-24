import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-3.1-flash-lite'

if (!GEMINI_API_KEY) {
  console.error('✖ GEMINI_API_KEY no está definida en .env')
  process.exit(1)
}

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Serve built frontend (production)
const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))

app.post('/api/transcribe', async (req, res) => {
  try {
    const { paginas } = req.body

    if (!paginas || !Array.isArray(paginas) || paginas.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos una imagen' })
    }

    const systemPrompt = `Eres un transcriptor literal de texto manuscrito de un cuaderno escolar. Vas a recibir una o varias imágenes que son fotos de las páginas de un mismo cuestionario manuscrito, en el orden en que fueron tomadas. Tu única tarea es leer todas las imágenes y transcribir EXACTAMENTE lo que está escrito, combinando el contenido de todas las páginas en un solo documento continuo, sin corregir ortografía, sin completar ideas y sin inventar ningún contenido que no esté visible en las imágenes.

Identificá el título general del cuestionario (normalmente al inicio de la primera página, puede estar subrayado, numerado o en letra más grande).

Luego identificá cada pregunta o tema del cuestionario como una SECCIÓN separada. Cada sección debe tener su propio título (la pregunta o número de pregunta) y su contenido (la respuesta escrita). Si una pregunta tiene sub-preguntas, agrupalas bajo el mismo título de sección en el contenido.

Si hay palabras o fragmentos que no podés leer con total certeza, NO los inventes ni los completes con suposiciones. Reemplazá COMPLETAMENTE la palabra o fragmento dudoso por ÚNICAMENTE el marcador {{N}} (donde N es un número empezando en 0) — no dejes la palabra original ni la escribas parcialmente, SOLO el marcador. Los marcadores {{N}} pueden aparecer tanto en el título de una sección como en su contenido. Agregá tu mejor estimación de la palabra reemplazada a la lista "dudas".

Respondé ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin explicaciones, sin backticks de markdown, con esta estructura exacta:
{"titulo": "título general del cuestionario, con marcadores {{N}} si aplica", "secciones": [{"titulo": "1. Primera pregunta", "contenido": "Respuesta con {{0}} si hay duda"}, {"titulo": "2. Segunda pregunta", "contenido": "Respuesta"}], "dudas": [{"id": 0, "estimado": "palabra o frase corta estimada"}]}

Si no hay secciones, "secciones" debe ser un arreglo vacío. Si no hay ninguna duda, "dudas" debe ser un arreglo vacío.`

    const parts = []
    paginas.forEach((p, i) => {
      parts.push({ text: `Página ${i + 1} de ${paginas.length}:` })
      parts.push({
        inline_data: {
          mime_type: p.mediaType || 'image/jpeg',
          data: p.base64,
        },
      })
    })

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 1000 },
        }),
      },
    )

    const data = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('Gemini error:', data)
      return res.status(502).json({ error: data.error?.message || 'Error en Gemini' })
    }

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    text = text.replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim()

    const parsed = JSON.parse(text)

    res.json(parsed)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ error: err.message || 'Error interno del servidor' })
  }
})

// SPA fallback: non-API routes serve the app shell
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'not found' })
  res.sendFile('index.html', { root: distPath })
})

app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`)
  console.log(`✓ Modelo: ${MODEL}`)
})
