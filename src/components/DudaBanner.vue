<script setup lang="ts">
defineProps<{ pendientes: number }>()
</script>

<template>
  <div v-if="pendientes > 0" class="duda-banner">
    ✏️
    <span>{{ pendientes }} palabra(s) que la IA no pudo leer con certeza.</span>
  </div>
</template>

<style scoped>
.duda-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--highlight-soft);
  border: 1px solid #d9ad33;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: var(--mono);
  font-size: 12.5px;
  color: #6b4f12;
  margin-bottom: 20px;
}
</style>
