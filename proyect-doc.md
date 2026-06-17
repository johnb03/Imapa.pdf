# Foto a Documento APA 7 — Documentación del Proyecto

> Prototipo MVP web que convierte una foto de un cuestionario manuscrito en un documento con formato APA 7 descargable en PDF, listo para subir a plataformas educativas virtuales.

---

## 1. Resumen del proyecto

El objetivo es resolver un problema concreto de estudiantes: tienen un cuestionario o trabajo respondido a mano en un cuaderno y necesitan entregarlo digitalmente, con formato APA 7, en una plataforma virtual que solo acepta archivos (generalmente PDF o Word).

El flujo central es: el estudiante fotografía las páginas de su cuaderno, una IA con visión lee el contenido manuscrito y separa título/pregunta de contenido/respuesta, el estudiante confirma o corrige las palabras que la IA no pudo leer con certeza, completa los datos de la carátula institucional, y descarga un PDF ya formateado.

La premisa de diseño más importante del proyecto es que **la IA transcribe, no redacta**: no debe completar, corregir ni inventar contenido que no esté visible en la imagen. Si hay duda, se marca y se le pregunta al estudiante en vez de adivinar.

## 2. Flujo de usuario

1. El estudiante toma o sube una foto por cada página de su cuestionario, en orden (puede agregar varias antes de procesar).
2. Toca "Leer documento con IA". Todas las imágenes se envían juntas en una sola consulta a un modelo con visión, que devuelve un título y un contenido combinados, además de una lista de palabras dudosas.
3. Se revisan las palabras marcadas (resaltadas en amarillo): tocando cada una se puede confirmar o corregir el texto estimado por la IA.
4. Se completan los datos de la carátula institucional (instituto, logo opcional, escuela, matrícula, participante, tema, fecha).
5. Se descarga el documento como PDF con formato APA 7 (portada + cuerpo del documento).

## 3. Arquitectura técnica (MVP actual)

El MVP actual es una **aplicación SPA con Vue 3 + TypeScript**:

- **Frontend:** Vue 3 con Composition API, TypeScript, Vite como bundler. Componentes atómicos: `ChalkSection`, `MetaForm`, `DocumentPreview`, `DudaPopover`, `PdfBar`, etc.
- **Backend:** Servidor Node.js (Express) que recibe las imágenes, las reenvía a Gemini y devuelve la respuesta. La API key vive solo del lado del servidor en `server/.env`.
- **IA:** Google Gemini 3.1 Flash Lite vía API REST. Las imágenes se envían como `inline_data` en base64. El modelo recibe un prompt estricto de transcripción literal.
- **PDF:** jsPDF directo (sin html2canvas). Construye el documento línea por línea con Times New Roman, márgenes APA 7, interlineado doble y sangría de primera línea.
- **Estado:** Composable `useDocument.ts` que centraliza el estado reactivo (páginas, dudas, metadatos, paso actual).
- No hay base de datos ni autenticación: cada sesión es independiente y nada se guarda entre visitas.

Esta arquitectura es intencionalmente simple para validar el concepto rápido, pero **no es apta para producción real** (ver sección de pendientes).

## 4. Tecnologías utilizadas

| Capa                         | Tecnología                                                                              | Notas                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Framework frontend           | Vue 3 + Composition API + TypeScript                                                    | SPA con Vite                                               |
| Estilos                      | CSS puro con variables (`:root`)                                                        | Sistema de diseño basado en tokens, ver sección 5           |
| IA de visión y transcripción | API de Google Gemini (modelo Gemini 3.1 Flash Lite)                                      | Recibe imágenes + instrucciones, devuelve JSON estructurado |
| Generación de PDF            | [jsPDF](https://github.com/parallax/jsPDF) (directo, sin html2canvas)                    | Construye el PDF línea por línea, más confiable que html2canvas |
| Bundler                      | Vite                                                                                    | Dev server + build optimizado                               |
| Tipografía                   | Google Fonts (Kalam, Source Serif 4, IBM Plex Mono) + Times New Roman para el documento | Ver sección 5                                               |

Para la versión de producción / app móvil, lo recomendable sería sumar:

- Backend propio (Node.js o Python) que actúe de intermediario con la API de IA, para no expuestos la llamada directamente desde el cliente.
- Base de datos (PostgreSQL, Firebase, Supabase) para guardar historial de documentos y datos de usuario.
- Autenticación de usuarios (estudiantes, posiblemente con cuentas institucionales).
- Para la app móvil: Flutter o React Native, reutilizando la misma lógica de prompt y de formato APA 7 ya validada en el MVP web.

## 5. Diseño visual (sistema de diseño)

### Concepto

La interfaz representa visualmente el viaje del producto: la sección de captura de fotos está estilizada como un **pizarrón de aula** (oscuro, tiza, tipografía manuscrita), y al procesar la imagen se revela una sección estilizada como **papel** (clara, tipografía serif formal). La metáfora visual es "de lo manuscrito a lo formal", la misma transformación que hace el producto.

### Paleta de colores

| Token                              | Valor                              | Uso                                                              |
| ---------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `--chalk-bg`                       | `#1f3326`                          | Fondo principal de la sección de captura (verde pizarrón)        |
| `--chalk-bg-deep`                  | `#162619`                          | Variante más oscura del fondo pizarrón                           |
| `--chalk-white`                    | `#eef0e6`                          | Texto principal sobre el pizarrón (tiza)                         |
| `--chalk-muted`                    | `#9fb3a0`                          | Texto secundario sobre el pizarrón                               |
| `--pen-red`                        | `#b5483d`                          | Color de acción/corrección (botones principales, marcas de duda) |
| `--pen-red-dark`                   | `#943a31`                          | Estado hover del rojo de acción                                  |
| `--paper`                          | `#fdfcf7`                          | Fondo de la sección de revisión/documento (papel)                |
| `--paper-edge`                     | `#e7e3d6`                          | Bordes y separadores sobre el papel                              |
| `--ink`                            | `#1c1c1a`                          | Texto principal del documento (casi negro, "tinta")              |
| `--ink-soft`                       | `#5a5a52`                          | Texto secundario sobre papel (etiquetas, notas)                  |
| `--highlight` / `--highlight-soft` | `#f0c14b` / `rgba(240,193,75,.32)` | Resaltado de palabras dudosas (estilo resaltador)                |

### Tipografía

| Fuente                            | Uso                                             | Por qué                                                                                                                                       |
| --------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kalam** (Google Fonts)          | Titulares de la sección pizarrón                | Evoca escritura a mano/tiza, refuerza la metáfora de "cuaderno"                                                                               |
| **Source Serif 4** (Google Fonts) | Texto de interfaz general, etiquetas de sección | Serif contemporánea, legible, da tono "editorial/académico" sin ser genérica                                                                  |
| **IBM Plex Mono** (Google Fonts)  | Etiquetas técnicas, botones, pasos, metadatos   | Aporta un acento "utilitario" que contrasta con la calidez de la tipografía manuscrita y serif                                                |
| **Times New Roman**               | Únicamente dentro del documento/PDF final       | Requisito de formato APA 7; es intencional que sea distinta al resto de la interfaz, porque es exactamente lo que el estudiante va a entregar |

### Detalles de interacción

- Los pasos del flujo (Foto → Lectura IA → Revisión → PDF) se muestran como una cadena de etiquetas tipo "chip", no como números genéricos en círculo, ya que el proceso es realmente secuencial y depende de pasos anteriores.
- Las palabras dudosas se marcan con `<mark>` resaltado y subrayado punteado rojo, imitando una corrección de profesor; al tocarlas se abre un popover para confirmarlas o corregirlas.
- El botón de descarga de PDF incluye un enlace de respaldo visible ("¿No se descargó solo? Tocá aquí para abrirlo"), porque la descarga automática de archivos puede ser bloqueada por el navegador en ciertos contextos (vistas previas dentro de iframes, Safari de iOS), y conviene no depender de un solo mecanismo.

## 6. Lógica de IA (prompt engineering)

El prompt que recibe el modelo establece reglas explícitas y no negociables:

- Actuar como **transcriptor literal**, no como redactor: no corregir ortografía, no completar ideas, no inventar contenido que no esté visible en la imagen.
- Identificar dos partes del texto: título/pregunta del cuestionario, y contenido/respuesta.
- Si hay varias imágenes, tratarlas como páginas consecutivas de un mismo documento y combinar el contenido en un único título y contenido continuo, respetando el orden.
- Cuando una palabra o fragmento no se puede leer con certeza, marcarla con un identificador (`{{N}}`) en el texto y agregarla a una lista de "dudas" con la mejor estimación, en lugar de adivinar silenciosamente.
- Responder únicamente en JSON estructurado, sin texto adicional, para que el resultado se pueda procesar de forma confiable en el cliente.

Esta es la pieza más sensible del producto: cualquier mejora futura del prompt debería mantener estas reglas, ya que son las que garantizan que el documento final sea fiel a lo que el estudiante escribió.

## 7. Formato APA 7 implementado

El documento generado actualmente respeta:

- Márgenes de 2.54 cm (1 pulgada) en todos los lados.
- Tipografía Times New Roman, 12 pt.
- Interlineado doble.
- Sangría de primera línea de 1.27 cm en el contenido.
- Portada en página separada (salto de página antes del cuerpo del documento).
- Título centrado y en negrita, repetido al inicio del cuerpo del documento.

Pendiente de ajustar a futuro: numeración de páginas y encabezado corto ("running head" simplificado en estudiantes desde la 7ª edición), que APA 7 recomienda pero que el MVP todavía no incluye.

## 8. Estructura de "Datos del trabajo" (carátula)

Los campos actuales de la carátula, según la estructura solicitada, son:

- **Logo del instituto** (opcional, imagen subida por el usuario, se muestra centrado arriba de todo si está presente).
- **Nombre del instituto**
- **Escuela**
- **Matrícula**
- **Participante**
- **Tema** (se autocompleta con el título detectado por la IA, pero queda editable)
- **Fecha**

## 9. Limitaciones actuales del MVP

- Sin backend: la llamada a la IA se hace directo desde el navegador, lo que en producción expondría lógica de negocio y no permite controlar costos ni abuso de forma centralizada.
- Sin persistencia: no hay manera de guardar documentos entre sesiones ni de que un estudiante recupere un trabajo a medio terminar.
- Límite de longitud de respuesta de la IA pensado para respuestas de cuestionario típicas, no para ensayos extensos.
- Procesar muchas imágenes de alta resolución en una sola consulta aumenta el tiempo de respuesta y el tamaño de la petición; falta compresión/redimensionado de imágenes en el cliente.
- No hay numeración de páginas ni encabezado corto en el PDF (detalle de APA 7 pendiente).
- No se valida si la imagen subida realmente contiene texto legible antes de gastar una consulta a la IA.

## 10. Pendientes de desarrollo (roadmap)

**Corto plazo (siguientes iteraciones del MVP web)**

- Compresión/redimensionado de imágenes en el cliente antes de enviarlas a la IA.
- Numeración de páginas y encabezado corto en el PDF, para cumplir APA 7 por completo.
- Manejo de errores más claro cuando la IA no detecta texto en la imagen (ej. foto borrosa o vacía).
- Permitir reordenar páginas ya agregadas (por si se subieron fuera de orden).

**Mediano plazo (camino a producto real)**

- Backend propio que intermedie la llamada a la IA (oculta lógica de negocio, permite controlar costos y límites de uso).
- Autenticación de usuarios y guardado de historial de documentos.
- Soporte para más de un formato de salida (Word/.docx además de PDF), ya que algunas plataformas piden el archivo editable.
- Plantillas de carátula adicionales, además de la institucional actual, para distintos tipos de instituciones.

**Largo plazo**

- Versión nativa o multiplataforma (Flutter / React Native) reutilizando la lógica de IA y de formato ya validada.
- Panel para profesores o instituciones (opcional), si el producto evoluciona hacia un uso institucional y no solo individual.

## 11. Consejos para producción / próximos pasos

- No mover la lógica del prompt de "no inventar nada" a un backend sin revisarla con cuidado: es el corazón de la confianza del producto, y cualquier cambio ahí debería probarse con varios tipos de letra antes de lanzar.
- Si en el futuro se guardan fotos de tareas de estudiantes (posiblemente menores de edad), conviene definir desde el inicio una política clara de privacidad y retención de datos, y evitar guardar imágenes más tiempo del necesario.
- Antes de escalar a más usuarios, conviene mover la llamada a la IA detrás de un backend propio, tanto por seguridad como para poder controlar costos por usuario.
- Vale la pena probar el flujo con letra de distintos estudiantes reales (no solo letra prolija) antes de considerar el prompt "terminado": la letra manuscrita varía muchísimo y es la principal fuente de error del sistema.
- Mantener el mecanismo de descarga con respaldo (enlace manual además del automático), ya que el comportamiento de descarga de archivos varía bastante entre navegadores y dispositivos móviles.

## 12. Referencias

- Guía oficial de estilo APA 7ª edición: <https://apastyle.apa.org/>
- Documentación de la API de Google Gemini: <https://ai.google.dev/gemini-api/docs>
- Librería jsPDF: <https://github.com/parallax/jsPDF>
- Tipografía Kalam (Google Fonts): <https://fonts.google.com/specimen/Kalam>
- Tipografía Source Serif 4 (Google Fonts): <https://fonts.google.com/specimen/Source+Serif+4>
- Tipografía IBM Plex Mono (Google Fonts): <https://fonts.google.com/specimen/IBM+Plex+Mono>

## 13. Estructura del proyecto (Vue 3)

```
foto-a-documento-apa/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── server/
│   ├── index.js                 # Servidor Express: proxy a Gemini API
│   ├── package.json
│   └── .env                     # GEMINI_API_KEY (no se sube a git)
├── src/
│   ├── main.ts                     # Entry point
│   ├── App.vue                     # Shell principal: layout, estilos globales, PDF download
│   ├── types/
│   │   └── index.ts                # Interfaces: Pagina, Duda, MetaData, GeminiResponse, Step
│   ├── services/
│   │   ├── gemini.ts               # Llamada al backend (proxy a Gemini)
│   │   └── pdfGenerator.ts         # Generación de PDF con jsPDF directo
│   ├── composables/
│   │   └── useDocument.ts          # Estado reactivo central (páginas, dudas, meta, pasos)
│   └── components/
│       ├── StepIndicator.vue       # Chips de progreso (Foto → Lectura IA → Revisión → PDF)
│       ├── ChalkSection.vue        # Sección pizarrón: carga de imágenes, botón de extracción
│       ├── MetaForm.vue            # Carátula editable con campos institucionales + logo
│       ├── DudaBanner.vue          # Banner de palabras dudosas
│       ├── DocumentPreview.vue     # Vista previa del documento con marcas de duda cliqueables
│       ├── DudaPopover.vue         # Popover para confirmar o corregir palabra dudosa
│       └── PdfBar.vue              # Barra inferior fija con botón de descarga PDF
```
