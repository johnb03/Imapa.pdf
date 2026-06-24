<script setup lang="ts">
import { ref } from 'vue'
import { generatePdf, generatePdfWithImages } from './services/pdfGenerator'
import { useDocument } from './composables/useDocument'
import ChalkSection from './components/ChalkSection.vue'
import MetaForm from './components/MetaForm.vue'
import DudaBanner from './components/DudaBanner.vue'
import DocumentPreview from './components/DocumentPreview.vue'
import DudaPopover from './components/DudaPopover.vue'
import PdfBar from './components/PdfBar.vue'

const {
  paginas,
  dudas,
  docTitulo,
  secciones,
  meta,
  logoDataUrl,
  step,
  loading,
  error,
  imageMode,
  dudasPendientes,
  agregarPagina,
  quitarPagina,
  leerDocumento,
  corregirDuda,
  setImageMode,
  setStep,
} = useDocument()

const popover = ref({ show: false, texto: '', x: 0, y: 0 })
let popoverDudaId: number | null = null
const pdfError = ref('')

function onAgregarPagina(file: File) {
  agregarPagina(file)
}

function onQuitarPagina(index: number) {
  quitarPagina(index)
}

function onLeer() {
  leerDocumento()
}

function onModoImagen() {
  setImageMode(true)
}

function onCorregir(dudaId: number) {
  const marks = Array.from(document.querySelectorAll('.documento .duda'))
  const estimado = dudas.value.find((d) => d.id === dudaId)?.estimado
  const target = marks.find((m) => m.textContent?.trim() === estimado)
  if (target) {
    const rect = target.getBoundingClientRect()
    popoverDudaId = dudaId
    popover.value = {
      show: true,
      texto: target.textContent || '',
      x: rect.left,
      y: rect.bottom + 8,
    }
  }
}

function onConfirmarPopover(texto: string) {
  if (popoverDudaId !== null) {
    corregirDuda(popoverDudaId, texto)
    popoverDudaId = null
  }
  popover.value.show = false
}

function onCerrarPopover() {
  popoverDudaId = null
  popover.value.show = false
}

document.addEventListener('click', (e) => {
  if (popover.value.show) {
    const target = e.target as HTMLElement
    if (!target.closest('.popover') && !target.closest('.duda')) {
      onCerrarPopover()
    }
  }
})

function onLogoCambio(dataUrl: string | null) {
  logoDataUrl.value = dataUrl
}

function onGuardarEdicion(data: { titulo: string; secciones: { titulo: string; contenido: string }[] }) {
  docTitulo.value = data.titulo
  secciones.value = data.secciones
  meta.tema = data.titulo
  dudas.value = []
}

function resolverMarcadores(texto: string): string {
  return texto.replace(/\{\{(\d+)\}\}/g, (_, id) => {
    const duda = dudas.value.find((d) => d.id === Number(id))
    return duda?.estimado ?? '___'
  })
}

function resolverSecciones(secciones: { titulo: string; contenido: string }[]) {
  return secciones.map((s) => ({
    titulo: resolverMarcadores(s.titulo),
    contenido: resolverMarcadores(s.contenido),
  }))
}

function onGenerarPdf() {
  pdfError.value = ''

  const faltantes: string[] = []
  if (!meta.instituto.trim()) faltantes.push('Instituto')
  if (!meta.escuela.trim()) faltantes.push('Escuela')
  if (!meta.matricula.trim()) faltantes.push('Matrícula')
  if (!meta.participante.trim()) faltantes.push('Participante')
  if (!meta.tema.trim()) faltantes.push('Tema')
  if (!meta.fecha.trim()) faltantes.push('Fecha')

  if (faltantes.length > 0) {
    pdfError.value = `Faltan campos obligatorios: ${faltantes.join(', ')}`
    return
  }

  setStep(4)
  const tituloFinal = meta.tema.trim()
  const pdfData = {
    logo: logoDataUrl.value,
    instituto: meta.instituto,
    escuela: meta.escuela,
    tema: tituloFinal,
    participante: meta.participante,
    matricula: meta.matricula,
    fecha: meta.fecha,
    titulo: tituloFinal,
    secciones: imageMode.value ? [] : resolverSecciones(secciones.value),
  }

  if (imageMode.value) {
    try {
      generatePdfWithImages(pdfData, paginas.value)
    } catch (e: any) {
      pdfError.value = e.message || 'Error al generar PDF con imágenes'
    }
  } else {
    generatePdf(pdfData)
  }
}
</script>

<template>
  <div class="app">
    <ChalkSection
      :paginas="paginas"
      :step="step"
      :loading="loading"
      :error="error"
      :image-mode="imageMode"
      @agregar="onAgregarPagina"
      @quitar="onQuitarPagina"
      @leer="onLeer"
      @modo-imagen="onModoImagen"
    />

    <section v-if="step >= 3 && (imageMode || secciones.length)" class="paper-section visible">
      <MetaForm
        v-model="meta"
        :logo-data-url="logoDataUrl"
        @logo-cambio="onLogoCambio"
      />

      <DudaBanner v-if="!imageMode" :pendientes="dudasPendientes" />

      <DocumentPreview
        v-if="!imageMode"
        :titulo="meta.tema || resolverMarcadores(docTitulo)"
        :secciones="secciones"
        :dudas="dudas"
        @corregir="onCorregir"
        @guardar="onGuardarEdicion"
      />

      <p v-if="imageMode" class="image-mode-note">
        Las {{ paginas.length }} imagen(es) se insertarán directamente en el PDF, cada una en su propia página con el encabezado "Desarrollo del ejercicio".
      </p>
    </section>

    <DudaPopover
      v-if="!imageMode"
      :show="popover.show"
      :texto="popover.texto"
      :x="popover.x"
      :y="popover.y"
      @confirmar="onConfirmarPopover"
      @cerrar="onCerrarPopover"
    />

    <div v-if="step >= 3 && (imageMode || secciones.length)" class="pdf-footer">
      <p v-if="pdfError" class="pdf-error">{{ pdfError }}</p>
      <PdfBar
        :meta="meta"
        :titulo="meta.tema || resolverMarcadores(docTitulo)"
        :secciones="imageMode ? [] : secciones"
        :logo-data-url="logoDataUrl"
        @generar="onGenerarPdf"
      />
    </div>

    <a
      class="sugerencias-flotante"
      href="mailto:johnbdesing@gmail.com?subject=Sugerencia%20-%20Imapa.pdf"
      target="_blank"
    >
      ¿Sugerencias?
    </a>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root {
  --chalk-bg: #1f3326;
  --chalk-bg-deep: #162619;
  --chalk-white: #eef0e6;
  --chalk-muted: #9fb3a0;
  --pen-red: #b5483d;
  --pen-red-dark: #943a31;
  --paper: #fdfcf7;
  --paper-edge: #e7e3d6;
  --ink: #1c1c1a;
  --ink-soft: #5a5a52;
  --highlight: #f0c14b;
  --highlight-soft: rgba(240, 193, 75, 0.32);
  --mono: 'IBM Plex Mono', monospace;
  --hand: 'Kalam', cursive;
  --serif-ui: 'Source Serif 4', Georgia, serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--paper);
  font-family: var(--serif-ui);
  color: var(--ink);
}

.paper-section {
  max-width: 760px;
  margin: 0 auto;
  padding: 40px 24px 100px;
}
.pdf-footer {
  max-width: 760px;
  margin: 0 auto;
}
.pdf-error {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--pen-red);
  background: rgba(181, 72, 61, 0.08);
  border: 1px solid rgba(181, 72, 61, 0.25);
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0 24px 8px;
  text-align: center;
}
.sugerencias-flotante {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 100;
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--ink-soft);
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(4px);
  border: 1px solid var(--paper-edge);
  border-radius: 8px;
  padding: 8px 14px;
  text-decoration: none;
  transition: color 0.15s, border-color 0.15s;
}
.sugerencias-flotante:hover {
  color: var(--pen-red);
  border-color: var(--pen-red);
}
.image-mode-note {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ink-soft);
  background: rgba(159, 179, 160, 0.1);
  border: 1px solid var(--paper-edge);
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  text-align: center;
}
</style>
