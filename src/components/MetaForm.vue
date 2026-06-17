<script setup lang="ts">
import type { MetaData } from '../types'

const meta = defineModel<MetaData>({ required: true })

const emit = defineEmits<{
  logoCambio: [dataUrl: string | null]
}>()

function handleLogo(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => emit('logoCambio', reader.result as string)
  reader.readAsDataURL(file)
}

function quitarLogo() {
  emit('logoCambio', null);
  (document.getElementById('logoInput') as HTMLInputElement).value = ''
}

defineProps<{ logoDataUrl: string | null }>()

const institutosLista = [
  'Universidad Autónoma de Santo Domingo (UASD)',
  'Instituto Tecnológico de Santo Domingo (INTEC)',
  'Universidad Nacional Pedro Henríquez Ureña (UNPHU)',
  'Universidad Iberoamericana (UNIBE)',
  'Universidad Abierta para Adultos (UAPA)',
  'Instituto Tecnológico de las Américas (ITLA)',
  'Instituto Técnico Superior Comunitario (ITSC)',
  'Universidad APEC (UNAPEC)',
  'Universidad Central del Este (UCE)',
  'Universidad Católica Santo Domingo (UCSD)',
]
</script>

<template>
  <p class="panel-label">Datos del trabajo</p>
  <div class="meta-card">
    <div class="meta-field logo-field">
      <label>Logo del instituto (opcional)</label>
      <div class="logo-upload">
        <div class="logo-preview">
          <img v-if="logoDataUrl" :src="logoDataUrl" />
          <span v-else>Sin logo</span>
        </div>
        <label class="logo-btn" for="logoInput">Subir logo</label>
        <input type="file" id="logoInput" accept="image/*" @change="handleLogo" />
        <button v-if="logoDataUrl" class="logo-remove" @click="quitarLogo">
          Quitar
        </button>
      </div>
    </div>
    <div class="meta-field">
      <label>Nombre del instituto</label>
      <input v-model="meta.instituto" list="institutos" placeholder="Elegí o escribí..." />
      <datalist id="institutos">
        <option v-for="inst in institutosLista" :key="inst" :value="inst" />
      </datalist>
    </div>
    <div class="meta-field">
      <label>Escuela</label>
      <input v-model="meta.escuela" placeholder="Ej. Escuela de Informática" />
    </div>
    <div class="meta-field">
      <label>Matrícula</label>
      <input v-model="meta.matricula" placeholder="Ej. 2023-0145" />
    </div>
    <div class="meta-field">
      <label>Participante</label>
      <input v-model="meta.participante" placeholder="Nombre del estudiante" />
    </div>
    <div class="meta-field">
      <label>Tema</label>
      <input v-model="meta.tema" placeholder="Tema del trabajo" />
    </div>
    <div class="meta-field">
      <label>Fecha</label>
      <input v-model="meta.fecha" placeholder="DD/MM/AAAA" />
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
.meta-card {
  background: #fff;
  border: 1px solid var(--paper-edge);
  border-radius: 10px;
  padding: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 28px;
}
.meta-field label {
  display: block;
  font-family: var(--mono);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-soft);
  margin-bottom: 5px;
}
.meta-field input {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--paper-edge);
  font-family: var(--serif-ui);
  font-size: 14px;
  padding: 4px 2px 6px;
  background: transparent;
  color: var(--ink);
}
.meta-field input:focus {
  outline: none;
  border-bottom-color: var(--pen-red);
}
.logo-field {
  grid-column: 1 / -1;
}
.logo-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-preview {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border: 1px dashed var(--paper-edge);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 9px;
  color: var(--ink-soft);
  overflow: hidden;
  text-align: center;
  line-height: 1.2;
}
.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo-btn {
  font-family: var(--mono);
  font-size: 11.5px;
  background: #fff;
  border: 1px solid var(--paper-edge);
  border-radius: 6px;
  padding: 7px 12px;
  cursor: pointer;
}
#logoInput {
  display: none;
}
.logo-remove {
  font-family: var(--mono);
  font-size: 11px;
  background: none;
  border: none;
  color: var(--pen-red);
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
@media (max-width: 560px) {
  .meta-card {
    grid-template-columns: 1fr;
  }
}
</style>
