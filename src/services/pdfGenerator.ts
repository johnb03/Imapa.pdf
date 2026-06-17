import { jsPDF } from 'jspdf'
import type { Seccion } from '../types'

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

function addHeader(doc: jsPDF, runningHead: string) {
  doc.setFont('Times', 'normal')
  doc.setFontSize(10)
  // Running head — left
  doc.text(runningHead, MARGIN, HEADER_Y)
  // Page number — right
  doc.text(String(doc.getCurrentPageInfo().pageNumber), PAGE_W - MARGIN, HEADER_Y, { align: 'right' })
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  indent: number,
  runningHead: string,
): number {
  const paragraphs = splitIntoParagraphs(text)
  let cursorY = y
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, maxW)
    for (let i = 0; i < lines.length; i++) {
      if (cursorY + LINE_H > PAGE_H - MARGIN) {
        doc.addPage()
        addHeader(doc, runningHead)
        cursorY = MARGIN
      }
      doc.text(lines[i] as string, x + (i === 0 ? indent : 0), cursorY)
      cursorY += LINE_H
    }
  }
  return cursorY
}

export function generatePdf(data: PdfData): void {
  const runningHead = data.titulo.substring(0, 50).toUpperCase()

  const doc = new jsPDF({
    unit: 'mm',
    format: 'letter',
    orientation: 'portrait',
  })

  // === PAGE 1 — cover ===
  addHeader(doc, runningHead)
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

  doc.setFont('Times', 'normal')
  doc.setFontSize(12)
  doc.text(data.escuela, PAGE_W / 2, y, { align: 'center' })
  y += 40

  doc.setFont('Times', 'bold')
  doc.text('TEMA', PAGE_W / 2, y, { align: 'center' })
  y += 6

  doc.setFontSize(13)
  const temaLines = doc.splitTextToSize(data.tema, CONTENT_W)
  for (const line of temaLines) {
    doc.text(line, PAGE_W / 2, y, { align: 'center' })
    y += 8
  }
  y += 50

  doc.setFontSize(12)
  doc.setFont('Times', 'bold')
  doc.text('Participante', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  doc.text(data.participante, PAGE_W / 2, y, { align: 'center' })
  y += 16
  doc.setFont('Times', 'bold')
  doc.text('Matrícula', PAGE_W / 2, y, { align: 'center' })
  y += 6
  doc.setFont('Times', 'normal')
  if (data.matricula) {
    doc.text(data.matricula, PAGE_W / 2, y, { align: 'center' })
  }
  y += 40
  if (data.fecha) {
    doc.text(data.fecha, PAGE_W / 2, y, { align: 'center' })
  }

  // === PAGE 2+ — body ===
  doc.addPage()
  addHeader(doc, runningHead)
  y = MARGIN

  // Title — centered bold (APA Level 1 heading)
  doc.setFont('Times', 'bold')
  doc.setFontSize(12)
  y = addWrappedText(doc, data.titulo, MARGIN, y, CONTENT_W, 0, runningHead)
  y += LINE_H

  // Sections — each with bold heading then content
  for (const sec of data.secciones) {
    doc.setFont('Times', 'bold')
    y = addWrappedText(doc, sec.titulo, MARGIN, y, CONTENT_W, 0, runningHead)

    doc.setFont('Times', 'normal')
    y = addWrappedText(doc, sec.contenido, MARGIN, y, CONTENT_W, FIRST_LINE_INDENT, runningHead)
    y += LINE_H
  }

  doc.save('documento.pdf')
}
