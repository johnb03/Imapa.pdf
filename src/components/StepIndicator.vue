<script setup lang="ts">
import type { Step } from '../types'

defineProps<{ step: Step }>()

const steps = [
  { num: 1, label: 'Foto' },
  { num: 2, label: 'Lectura IA' },
  { num: 3, label: 'Revisión' },
  { num: 4, label: 'PDF APA' },
]
</script>

<template>
  <div class="steps">
    <template v-for="(s, i) in steps" :key="s.num">
      <span v-if="i > 0" class="arrow">→</span>
      <span
        class="step"
        :class="{ active: step >= s.num }"
      >
        {{ s.num }} · {{ s.label }}
      </span>
    </template>
  </div>
</template>

<style scoped>
.steps {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.step {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--chalk-white);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 20px;
  padding: 6px 12px;
  white-space: nowrap;
}
.step.active {
  background: var(--pen-red);
  border-color: var(--pen-red);
}
.arrow {
  color: var(--chalk-muted);
  font-family: var(--mono);
  font-size: 13px;
}
</style>
