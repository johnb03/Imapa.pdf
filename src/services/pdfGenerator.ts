import { jsPDF } from 'jspdf'
import type { Pagina, Seccion } from '../types'

interface PdfData {
  logo: string | null
  instituto: string
  escuela: string
  tema: string
  participante: string
  matricula: string
  fecha: string
  titulo: string
  secciones: Seccion[]
}

const MARGIN = 25.4
const PAGE_W = 215.9
const PAGE_H = 279.4
const CONTENT_W = PAGE_W - 2 * MARGIN
const FIRST_LINE_INDENT = 12.7
const LINE_H = 8.5
const HEADER_Y = 14 // approx 0.55in — within top margin

function splitIntoParagraphs(text: string): string[] {
  return text.split('\n').map((p) => p.trim()).filter((p) => p.length > 0)
}

function addHeader(doc: jsPDF) {
  doc.setFont('Times', 'normal')
  doc.setFontSize(10)
  doc.text(String(doc.getCurrentPageInfo().pageNumber), PAGE_W - MARGIN, HEADER_Y, { align: 'right' })
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  indent: number,
): number {
  const paragraphs = splitIntoParagraphs(text)
  let cursorY = y
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, maxW)
    for (let i = 0; i < lines.length; i++) {
      if (cursorY + LINE_H > PAGE_H - MARGIN) {
        doc.addPage()
        addHeader(doc)
        cursorY = MARGIN
      }
      doc.text(lines[i] as string, x + (i === 0 ? indent : 0), cursorY)
      cursorY += LINE_H
    }
  }
  return cursorY
}

function downloadBlob(blob: Blob, filename: string) {
  console.log('downloadBlob called, blob size:', blob.size, 'type:', blob.type)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function generatePdf(data: PdfData): void {
  console.log('generatePdf called')
  const doc = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  })

  // === PAGE 1 — cover ===
  addHeader(doc)
  let y = MARGIN + 30

  doc.setFont('Times', 'normal')
  doc.setFontSize(12)

  // Logo with aspect ratio (max 40mm wide, 30mm tall)
  if (data.logo) {
    try {
      const fmt = data.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      const maxW = 40
      const maxH = 30
      let imgW = maxW
      let imgH = maxH
      const img = new Image()
      img.src = data.logo
      if (img.naturalWidth && img.naturalHeight) {
        const aspect = img.naturalWidth / img.naturalHeight
        if (aspect > maxW / maxH) {
          imgW = maxW
          imgH = maxW / aspect
        } else {
          imgH = maxH
          imgW = maxH * aspect
        }
      }
      doc.addImage(data.logo, fmt, PAGE_W / 2 - imgW / 2, y - 20, imgW, imgH)
      y += Math.max(imgH, 15) + 10
    } catch {
      /* logo skip */
    }
  }

  doc.setFont('Times', 'bold')
  doc.setFontSize(14)
  doc.text(data.instituto, PAGE_W / 2, y, { align: 'center' })
  y += 8

  doc.setFont('Times', 'bold')
  doc.text('Escuela', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  doc.setFontSize(12)
  doc.text(data.escuela, PAGE_W / 2, y, { align: 'center' })
  y += 25

  doc.setFont('Times', 'bold')
  doc.text('TEMA', PAGE_W / 2, y, { align: 'center' })
  y += 6

  doc.setFontSize(13)
  const temaLines = doc.splitTextToSize(data.tema, CONTENT_W)
  for (const line of temaLines) {
    doc.text(line, PAGE_W / 2, y, { align: 'center' })
    y += 8
  }
  y += 15

  doc.setFontSize(12)
  doc.setFont('Times', 'bold')
  doc.text('Participante', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  doc.text(data.participante, PAGE_W / 2, y, { align: 'center' })
  y += 10
  doc.setFont('Times', 'bold')
  doc.text('Matrícula', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  if (data.matricula) {
    doc.text(data.matricula, PAGE_W / 2, y, { align: 'center' })
  }
  y += 14
  if (data.fecha) {
    doc.text(data.fecha, PAGE_W / 2, y, { align: 'center' })
  }

  // === PAGE 2+ — body ===
  doc.addPage()
  addHeader(doc)
  y = MARGIN

  // Title — centered bold (APA Level 1 heading)
  doc.setFont('Times', 'bold')
  doc.setFontSize(12)
  const tituloLines = doc.splitTextToSize(data.titulo, CONTENT_W)
  for (const line of tituloLines) {
    if (y + LINE_H > PAGE_H - MARGIN) {
      doc.addPage()
      addHeader(doc)
      y = MARGIN
    }
    doc.text(line, PAGE_W / 2, y, { align: 'center' })
    y += LINE_H
  }
  y += LINE_H

  // Sections — each with bold heading then content
  for (const sec of data.secciones) {
    doc.setFont('Times', 'bold')
    y = addWrappedText(doc, sec.titulo, MARGIN, y, CONTENT_W, 0)

    doc.setFont('Times', 'normal')
    y = addWrappedText(doc, sec.contenido, MARGIN, y, CONTENT_W, FIRST_LINE_INDENT)
    y += LINE_H
  }

  const blob = doc.output('blob')
  downloadBlob(blob, 'documento.pdf')
}

export function generatePdfWithImages(data: PdfData, paginas: Pagina[]): void {
  console.log('generatePdfWithImages called')
  const doc = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  })

  // === PAGE 1 — cover ===
  addHeader(doc)
  let y = MARGIN + 30

  doc.setFont('Times', 'normal')
  doc.setFontSize(12)

  // Logo with aspect ratio (max 40mm wide, 30mm tall)
  if (data.logo) {
    try {
      const fmt = data.logo.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      const maxW = 40
      const maxH = 30
      let imgW = maxW
      let imgH = maxH
      const img = new Image()
      img.src = data.logo
      if (img.naturalWidth && img.naturalHeight) {
        const aspect = img.naturalWidth / img.naturalHeight
        if (aspect > maxW / maxH) {
          imgW = maxW
          imgH = maxW / aspect
        } else {
          imgH = maxH
          imgW = maxH * aspect
        }
      }
      doc.addImage(data.logo, fmt, PAGE_W / 2 - imgW / 2, y - 20, imgW, imgH)
      y += Math.max(imgH, 15) + 10
    } catch {
      /* logo skip */
    }
  }

  doc.setFont('Times', 'bold')
  doc.setFontSize(14)
  doc.text(data.instituto, PAGE_W / 2, y, { align: 'center' })
  y += 8

  doc.setFont('Times', 'bold')
  doc.text('Escuela', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  doc.setFontSize(12)
  doc.text(data.escuela, PAGE_W / 2, y, { align: 'center' })
  y += 25

  doc.setFont('Times', 'bold')
  doc.text('TEMA', PAGE_W / 2, y, { align: 'center' })
  y += 6

  doc.setFontSize(13)
  const temaLines = doc.splitTextToSize(data.tema, CONTENT_W)
  for (const line of temaLines) {
    doc.text(line, PAGE_W / 2, y, { align: 'center' })
    y += 8
  }
  y += 15

  doc.setFontSize(12)
  doc.setFont('Times', 'bold')
  doc.text('Participante', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  doc.text(data.participante, PAGE_W / 2, y, { align: 'center' })
  y += 10
  doc.setFont('Times', 'bold')
  doc.text('Matrícula', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  if (data.matricula) {
    doc.text(data.matricula, PAGE_W / 2, y, { align: 'center' })
  }
  y += 14
  if (data.fecha) {
    doc.text(data.fecha, PAGE_W / 2, y, { align: 'center' })
  }

  // === IMAGE PAGES ===
  for (const pagina of paginas) {
    doc.addPage()
    addHeader(doc)

    doc.setFont('Times', 'bold')
    doc.setFontSize(12)
    doc.text('Desarrollo del ejercicio', PAGE_W / 2, MARGIN + 10, { align: 'center' })

    try {
      const fmt = pagina.mediaType === 'image/png' ? 'PNG' : 'JPEG'
      const imgW = CONTENT_W
      const imgH = PAGE_H - 2 * MARGIN - 30
      const imgX = PAGE_W / 2 - imgW / 2
      const imgY = MARGIN + 20
      doc.addImage(pagina.base64, fmt, imgX, imgY, imgW, imgH)
    } catch {
      // skip image if it fails to render
    }
  }

  const blob = doc.output('blob')
  downloadBlob(blob, 'documento.pdf')
}
