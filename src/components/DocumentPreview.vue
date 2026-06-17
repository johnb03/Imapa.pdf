<script setup lang="ts">
import { computed } from 'vue'
import type { Duda, Seccion } from '../types'

const props = defineProps<{
  titulo: string
  secciones: Seccion[]
  dudas: Duda[]
}>()

const emit = defineEmits<{
  corregir: [dudaId: number]
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
</script>

<template>
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
@media (max-width: 560px) {
  .sheet {
    padding: 36px 22px;
  }
}
</style>
