<script setup lang="ts">
import { ref } from 'vue'
import type { MetaData } from '../types'

import type { Seccion } from '../types'

const props = defineProps<{
  meta: MetaData
  titulo: string
  secciones: Seccion[]
  logoDataUrl: string | null
}>()

const emit = defineEmits<{
  generar: []
}>()

const loading = ref(false)

async function generarPdf() {
  loading.value = true
  emit('generar')
  loading.value = false
}
</script>

<template>
  <div class="bottom-bar">
    <button class="btn-pdf" @click="generarPdf" :disabled="loading">
      {{ loading ? 'Generando PDF...' : 'Descargar PDF (APA 7)' }}
    </button>
    <span class="bottom-note">
      Se genera en tu navegador, no se guarda en ningún servidor.
    </span>
  </div>
</template>

<style scoped>
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  border-top: 1px solid var(--paper-edge);
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
}
.btn-pdf {
  background: var(--ink);
  color: #fff;
  font-family: var(--mono);
  font-size: 13px;
  border: none;
  border-radius: 8px;
  padding: 12px 26px;
  cursor: pointer;
}
.btn-pdf:hover {
  background: #000;
}
.btn-pdf:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.bottom-note {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--ink-soft);
}
@media (max-width: 560px) {
  .bottom-bar {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
