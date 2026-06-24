<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Duda, Seccion } from '../types'

const props = defineProps<{
  titulo: string
  secciones: Seccion[]
  dudas: Duda[]
}>()

const emit = defineEmits<{
  corregir: [dudaId: number]
  guardar: [data: { titulo: string; secciones: { titulo: string; contenido: string }[] }]
}>()

interface Segment {
  type: 'text' | 'duda'
  text: string
  dudaId?: number
}

function parsear(texto: string): Segment[] {
  const partes = texto.split(/(\{\{\d+\}\})/g)
  return partes.map((p) => {
    const match = p.match(/^\{\{(\d+)\}\}$/)
    if (match) {
      const id = Number(match[1])
      const duda = props.dudas.find((d) => d.id === id)
      return { type: 'duda', text: duda?.estimado ?? '___', dudaId: id }
    }
    return { type: 'text', text: p }
  })
}

const seccionesConSegments = computed(() =>
  props.secciones.map((s) => ({
    titulo: parsear(s.titulo),
    contenido: parsear(s.contenido),
  })),
)

const editando = ref(false)
const editTitulo = ref('')
const editSecciones = ref<{ titulo: string; contenido: string }[]>([])

function resolver(texto: string): string {
  return texto.replace(/\{\{(\d+)\}\}/g, (_, id) => {
    const duda = props.dudas.find((d) => d.id === Number(id))
    return duda?.estimado ?? '___'
  })
}

function entrarEdicion() {
  editTitulo.value = resolver(props.titulo)
  editSecciones.value = props.secciones.map(s => ({
    titulo: resolver(s.titulo),
    contenido: resolver(s.contenido),
  }))
  editando.value = true
}

function guardarEdicion() {
  emit('guardar', { titulo: editTitulo.value, secciones: editSecciones.value })
  editando.value = false
}

function cancelarEdicion() {
  editando.value = false
}
</script>

<template>
  <template v-if="!editando">
    <p class="panel-label">Vista previa del documento (formato APA 7)</p>
    <div class="sheet">
      <div class="documento">
        <p class="titulo">{{ titulo }}</p>

        <div v-for="(sec, si) in seccionesConSegments" :key="si" class="seccion">
          <p class="seccion-titulo">
            <template v-for="(seg, i) in sec.titulo" :key="'st-'+i">
              <span v-if="seg.type === 'duda'" class="duda" @click="emit('corregir', seg.dudaId!)">
                {{ seg.text }}
              </span>
              <span v-else>{{ seg.text }}</span>
            </template>
          </p>
          <p class="seccion-contenido">
            <template v-for="(seg, i) in sec.contenido" :key="'sc-'+i">
              <span v-if="seg.type === 'duda'" class="duda" @click="emit('corregir', seg.dudaId!)">
                {{ seg.text }}
              </span>
              <span v-else>{{ seg.text }}</span>
            </template>
          </p>
        </div>
      </div>
    </div>
    <button class="btn-editar" @click="entrarEdicion">Editar texto</button>
  </template>

  <template v-else>
    <p class="panel-label">Editar documento</p>
    <div class="sheet">
      <div class="editor">
        <div class="editor-field">
          <label>Título</label>
          <textarea v-model="editTitulo" rows="2" class="editor-textarea" />
        </div>
        <div v-for="(sec, i) in editSecciones" :key="i" class="editor-seccion">
          <div class="editor-field">
            <label>Sección {{ i + 1 }} — Título</label>
            <input v-model="sec.titulo" class="editor-input" />
          </div>
          <div class="editor-field">
            <label>Contenido</label>
            <textarea v-model="sec.contenido" rows="6" class="editor-textarea" />
          </div>
        </div>
        <div class="editor-actions">
          <button class="btn-guardar" @click="guardarEdicion">Guardar cambios</button>
          <button class="btn-cancelar" @click="cancelarEdicion">Cancelar</button>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.panel-label {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
  margin: 0 0 10px;
}
.sheet {
  background: #fff;
  border: 1px solid var(--paper-edge);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  padding: 60px 56px;
}
.documento {
  font-family: "Times New Roman", Georgia, serif;
  font-size: 15px;
  line-height: 2;
  color: var(--ink);
}
.documento .titulo {
  text-align: center;
  font-weight: 700;
  margin: 0 0 10px;
}
.seccion {
  margin-top: 4px;
}
.seccion-titulo {
  font-weight: 700;
  margin: 18px 0 0;
}
.seccion-contenido {
  text-indent: 1.27cm;
  margin-top: 4px;
  white-space: pre-wrap;
}
.duda {
  background: var(--highlight-soft);
  border-bottom: 2px dotted var(--pen-red);
  cursor: pointer;
  padding: 0 2px;
  position: relative;
}
.btn-editar {
  display: block;
  margin: 16px auto 0;
  font-family: var(--mono);
  font-size: 11.5px;
  background: #fff;
  border: 1px solid var(--paper-edge);
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--ink-soft);
  transition: color 0.15s, border-color 0.15s;
}
.btn-editar:hover {
  color: var(--pen-red);
  border-color: var(--pen-red);
}
.editor {
  font-family: var(--serif-ui);
  font-size: 14px;
  color: var(--ink);
}
.editor-field {
  margin-bottom: 16px;
}
.editor-field label {
  display: block;
  font-family: var(--mono);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  margin-bottom: 5px;
}
.editor-input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--paper-edge);
  font-family: var(--serif-ui);
  font-size: 14px;
  padding: 4px 2px 6px;
  background: transparent;
  color: var(--ink);
}
.editor-input:focus {
  outline: none;
  border-bottom-color: var(--pen-red);
}
.editor-textarea {
  width: 100%;
  border: 1px solid var(--paper-edge);
  border-radius: 4px;
  font-family: var(--serif-ui);
  font-size: 14px;
  padding: 8px;
  background: transparent;
  color: var(--ink);
  resize: vertical;
  line-height: 1.6;
}
.editor-textarea:focus {
  outline: none;
  border-color: var(--pen-red);
}
.editor-seccion {
  border-top: 1px solid var(--paper-edge);
  padding-top: 16px;
  margin-top: 8px;
}
.editor-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}
.btn-guardar {
  font-family: var(--mono);
  font-size: 12px;
  background: var(--chalk-bg);
  color: var(--chalk-white);
  border: none;
  border-radius: 6px;
  padding: 10px 22px;
  cursor: pointer;
  font-weight: 600;
}
.btn-guardar:hover {
  background: var(--pen-red);
}
.btn-cancelar {
  font-family: var(--mono);
  font-size: 12px;
  background: #fff;
  border: 1px solid var(--paper-edge);
  border-radius: 6px;
  padding: 10px 22px;
  cursor: pointer;
  color: var(--ink-soft);
}
.btn-cancelar:hover {
  color: var(--pen-red);
  border-color: var(--pen-red);
}
@media (max-width: 560px) {
  .sheet {
    padding: 36px 22px;
  }
}
</style>
