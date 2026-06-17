export interface Pagina {
  base64: string
  mediaType: string
  previewUrl: string
}

export interface Duda {
  id: number
  estimado: string
}

export interface Seccion {
  titulo: string
  contenido: string
}

export interface MetaData {
  instituto: string
  escuela: string
  matricula: string
  participante: string
  tema: string
  fecha: string
}

export interface GeminiResponse {
  titulo: string
  secciones: Seccion[]
  dudas: Duda[]
}

export type Step = 1 | 2 | 3 | 4
