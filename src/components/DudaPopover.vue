<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  show: boolean
  texto: string
  x: number
  y: number
}>()

const emit = defineEmits<{
  confirmar: [texto: string]
  cerrar: []
}>()

const input = ref('')
const inputEl = ref<HTMLInputElement | null>(null)

watch(
  () => props.show,
  async (v) => {
    if (v) {
      input.value = props.texto
      await nextTick()
      inputEl.value?.focus()
    }
  },
)

function confirmar() {
  emit('confirmar', input.value || props.texto)
}

function cerrar() {
  emit('cerrar')
}
</script>

<template>
  <div
    v-if="show"
    class="popover show"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    <p>La IA no está segura de esta palabra. Confirmá o corregí:</p>
    <input ref="inputEl" v-model="input" @keydown.enter="confirmar" />
    <button @click="confirmar">Confirmar</button>
  </div>
</template>

<style scoped>
.popover {
  position: fixed;
  z-index: 20;
  background: var(--chalk-bg-deep);
  color: var(--chalk-white);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.3);
  font-family: var(--mono);
  font-size: 12px;
  width: 230px;
}
.popover p {
  margin: 0 0 8px;
  color: var(--chalk-muted);
}
.popover input {
  width: 100%;
  font-family: var(--serif-ui);
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 5px;
  border: none;
  margin-bottom: 8px;
}
.popover button {
  width: 100%;
  background: var(--pen-red);
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 7px;
  font-family: var(--mono);
  font-size: 11.5px;
  cursor: pointer;
}
</style>
