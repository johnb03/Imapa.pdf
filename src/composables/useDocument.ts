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

  function agregarPagina(file: File) {
    return new Promise<void>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        paginas.value.push({
          base64: (reader.result as string).split(',')[1],
          mediaType: file.type || 'image/jpeg',
          previewUrl: reader.result as string,
        })
        error.value = ''
        resolve()
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
