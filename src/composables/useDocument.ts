import { ref, reactive, computed } from 'vue'
import type { Pagina, Duda, Seccion, MetaData, Step } from '../types'
import { transcribeImagenes } from '../services/gemini'

export function useDocument() {
  const paginas = ref<Pagina[]>([])
  const dudas = ref<Duda[]>([])
  const docTitulo = ref('')
  const secciones = ref<Seccion[]>([])
  const step = ref<Step>(1)
  const loading = ref(false)
  const error = ref('')
  const logoDataUrl = ref<string | null>(null)
  const imageMode = ref(false)

  const meta = reactive<MetaData>({
    instituto: '',
    escuela: '',
    matricula: '',
    participante: '',
    tema: '',
    fecha: '',
  })

  const dudasPendientes = computed(() => {
    const enTitulo = docTitulo.value.match(/\{\{(\d+)\}\}/g) ?? []
    const enSecciones = secciones.value.flatMap((s) => [
      ...(s.titulo.match(/\{\{(\d+)\}\}/g) ?? []),
      ...(s.contenido.match(/\{\{(\d+)\}\}/g) ?? []),
    ])
    return enTitulo.length + enSecciones.length
  })

  const MAX_IMG_DIM = 2048

  function agregarPagina(file: File): Promise<void> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const rawDataUrl = reader.result as string
        const mediaType = file.type || 'image/jpeg'
        const img = new Image()
        img.onload = () => {
          let { naturalWidth: w, naturalHeight: h } = img
          if (w > MAX_IMG_DIM || h > MAX_IMG_DIM) {
            const ratio = Math.min(MAX_IMG_DIM / w, MAX_IMG_DIM / h)
            w = Math.round(w * ratio)
            h = Math.round(h * ratio)
          }
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, w, h)
          const resized = canvas.toDataURL(mediaType === 'image/png' ? 'image/png' : 'image/jpeg', 0.85)
          paginas.value.push({
            base64: resized.split(',')[1],
            mediaType,
            previewUrl: rawDataUrl,
          })
          error.value = ''
          resolve()
        }
        img.onerror = () => {
          // fallback: push original if image load fails
          paginas.value.push({
            base64: rawDataUrl.split(',')[1],
            mediaType,
            previewUrl: rawDataUrl,
          })
          error.value = ''
          resolve()
        }
        img.src = rawDataUrl
      }
      reader.readAsDataURL(file)
    })
  }

  function quitarPagina(index: number) {
    paginas.value.splice(index, 1)
  }

  function setImageMode(val: boolean) {
    imageMode.value = val
    if (val) {
      step.value = 3
    }
  }

  async function leerDocumento() {
    if (paginas.value.length === 0) return
    imageMode.value = false
    loading.value = true
    error.value = ''
    step.value = 2

    try {
      const result = await transcribeImagenes(paginas.value)
      dudas.value = result.dudas
      docTitulo.value = result.titulo
      secciones.value = result.secciones ?? []
      if (!meta.tema) {
        meta.tema = result.titulo.replace(/\{\{(\d+)\}\}/g, (_, id) => {
          const duda = dudas.value.find((d) => d.id === Number(id))
          return duda?.estimado ?? '___'
        }).trim()
      }
      step.value = 3
    } catch (e: any) {
      error.value = e.message || 'No se pudo leer la imagen. Probá con una foto más clara.'
    } finally {
      loading.value = false
    }
  }

  function corregirDuda(id: number, nuevoTexto: string) {
    const reemplazar = (str: string) =>
      str.replace(new RegExp(`\\{\\{${id}\\}\\}`, 'g'), nuevoTexto)
    docTitulo.value = reemplazar(docTitulo.value)
    secciones.value = secciones.value.map((s) => ({
      titulo: reemplazar(s.titulo),
      contenido: reemplazar(s.contenido),
    }))
  }

  function setStep(s: Step) {
    step.value = s
  }

  return {
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
  }
}
