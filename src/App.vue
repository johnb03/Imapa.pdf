<script setup lang="ts">
import { ref } from 'vue'
import { generatePdf } from './services/pdfGenerator'
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
  dudasPendientes,
  agregarPagina,
  quitarPagina,
  leerDocumento,
  corregirDuda,
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
    const duda = dudas.value.find((d) => d.id === popoverDudaId)
    if (duda) duda.estimado = texto
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
  if (!meta.participante.trim()) faltantes.push('Participante')
  if (!meta.tema.trim() && !docTitulo.value.trim()) faltantes.push('Tema')

  if (faltantes.length > 0) {
    pdfError.value = `Faltan campos obligatorios: ${faltantes.join(', ')}`
    return
  }

  setStep(4)
  const tituloFinal = meta.tema || resolverMarcadores(docTitulo.value).trim()
  generatePdf({
    logo: logoDataUrl.value,
    instituto: meta.instituto,
    escuela: meta.escuela || '',
    tema: tituloFinal,
    participante: meta.participante,
    matricula: meta.matricula || '',
    fecha: meta.fecha || '',
    titulo: tituloFinal,
    secciones: resolverSecciones(secciones.value),
  })
}
</script>

<template>
  <div class="app">
    <ChalkSection
      :paginas="paginas"
      :step="step"
      :loading="loading"
      :error="error"
      @agregar="onAgregarPagina"
      @quitar="onQuitarPagina"
      @leer="onLeer"
    />

    <section v-if="step >= 3 && secciones.length" class="paper-section visible">
      <MetaForm
        v-model="meta"
        :logo-data-url="logoDataUrl"
        @logo-cambio="onLogoCambio"
      />

      <DudaBanner :pendientes="dudasPendientes" />

      <DocumentPreview
        :titulo="meta.tema || resolverMarcadores(docTitulo.value)"
        :secciones="secciones"
        :dudas="dudas"
        @corregir="onCorregir"
      />
    </section>

    <DudaPopover
      :show="popover.show"
      :texto="popover.texto"
      :x="popover.x"
      :y="popover.y"
      @confirmar="onConfirmarPopover"
      @cerrar="onCerrarPopover"
    />

    <div v-if="step >= 3 && secciones.length" class="pdf-footer">
      <p v-if="pdfError" class="pdf-error">{{ pdfError }}</p>
      <PdfBar
        :meta="meta"
        :titulo="meta.tema || resolverMarcadores(docTitulo.value)"
        :secciones="secciones"
        :logo-data-url="logoDataUrl"
        @generar="onGenerarPdf"
      />
    </div>

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
</style>
