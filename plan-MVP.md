# Plan MVP — Foto a Documento APA 7

> **Stack:** Gemini 3.1 Flash Lite · Vue 3 · Node.js · html2pdf.js · TypeScript
> **Última actualización:** 2026-06-17
> **Status:** En progreso

---

## Fase 0 — API Key (prerequisito)

- [x] Conseguir API key de Gemini: https://aistudio.google.com/apikey
- [x] Guardarla de forma segura (`.env`)
- [x] Modelo: `gemini-3.1-flash-lite` (1.5-flash discontinuado)

---

## Fase 1 — Backend Node.js (proxy de IA)

Proxy que recibe imágenes desde el frontend y las reenvía a Gemini, ocultando la API key.

### API differences Anthropic → Gemini

| Aspecto | Anthropic (antes) | Gemini |
|---|---|---|
| Endpoint | `POST /v1/messages` | `POST /v1beta/models/gemini-3.1-flash-lite:generateContent` |
| Auth | `x-api-key` header | `x-goog-api-key` header |
| Imágenes | `{type:"image", source:{type:"base64",...}}` | `{inline_data:{mime_type:"", data:""}}` |
| System prompt | Dentro del mensaje user | `system_instruction: {parts:[{text}]}` |
| Response | `data.content[0].text` | `data.candidates[0].content.parts[0].text` |

### Archivos creados
- [x] `server/index.js` — servidor Express + proxy a Gemini
- [x] `server/package.json` — con `express`, `dotenv`, `cors`
- [x] `server/.env` — `GEMINI_API_KEY=...`, `PORT=3001`
- [x] Actualizado `src/services/gemini.ts` — apunta a backend local

---

## Fase 2 — Frontend: adaptar a Gemini + fixes

Sobre `foto-a-documento-apa.html`:

- [x] Cambiar endpoint de Anthropic a backend propio
- [x] Adaptar payload a formato Gemini (`inline_data`)
- [x] Parsear respuesta de Gemini (`candidates[0].content.parts[0].text`)
- [x] Comprimir/redimensionar imágenes antes de enviar
- [x] Migrar a Vue 3 + TypeScript + Vite
- [x] Manejo de errores robusto
- [x] Reemplazar html2pdf.js por jsPDF directo

---

## Fase 3 — APA 7 completo en el PDF

- [x] Numeración de páginas
- [x] Running head (encabezado corto APA 7)
- [x] Validar campos obligatorios antes de generar
- [x] Feedback de progreso durante generación

---

## Fase 4 — Git + Deploy

- [ ] `git init`, `.gitignore`
- [ ] Subir a GitHub
- [ ] Deploy en Railway / Render

---

## Fase 5 — Post-MVP (opcional)

- [ ] Compresión de imágenes más agresiva
- [ ] Reordenar páginas
- [ ] Soporte .docx
- [ ] Autenticación / historial

---

## Changelog

| Fecha | Cambio |
|---|---|
| 2026-06-17 | Plan inicial creado. Definido stack: Gemini 1.5 Flash + Node.js. |
| 2026-06-17 | `proyect-doc.md`: reemplazadas todas las referencias de Anthropic/Claude por Google Gemini. Arquitectura actualizada a frontend + backend Node.js. |
| 2026-06-17 | Migración a Vue 3 + TypeScript + Vite. Componentes creados. Composable useDocument.ts. Servicio gemini.ts. |
| 2026-06-17 | API key de Gemini configurada. Modelo actualizado a `gemini-3.1-flash-lite` (1.5-flash discontinuado). |
| 2026-06-17 | Fix PDF: los marcadores {{N}} ahora se resuelven con la palabra estimada en vez de borrarse. Fix aplicado en App.vue y useDocument.ts. |
| 2026-06-17 | Reemplazado html2pdf.js por jsPDF directo. Eliminada dependencia de html2canvas. PDF se construye línea por línea con Times. |
| 2026-06-17 | **Fase 2 completa**: Backend Node.js (server/index.js) creado. API key movida al servidor. Frontend apunta a `localhost:3001/api/transcribe`. |
| 2026-06-17 | Documentación actualizada: proyect-doc.md refleja jsPDF directo + backend server. |
| 2026-06-17 | **Fase 3 completa**: Running head + numeración en cada página. Validación de campos obligatorios (instituto, participante, tema). PDFError feedback. Logo con aspect ratio. Upload múltiple. Lista de universidades en datalist. IA ahora devuelve secciones[] por pregunta. |
