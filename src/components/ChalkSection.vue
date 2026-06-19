<script setup lang="ts">
import type { Pagina } from "../types";
import StepIndicator from "./StepIndicator.vue";
import type { Step } from "../types";

const props = defineProps<{
  paginas: Pagina[];
  step: Step;
  loading: boolean;
  error: string;
  imageMode?: boolean;
}>();

const emit = defineEmits<{
  agregar: [file: File];
  quitar: [index: number];
  leer: [];
  modoImagen: [];
}>();

function handleFile(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input?.files;
  if (files && files.length > 0) {
    for (const file of Array.from(files)) {
      emit("agregar", file);
    }
    input.value = "";
  }
}

function triggerFileInput() {
  const input = document.getElementById("fileInput") as HTMLInputElement;
  input?.click();
}
</script>

<template>
  <section class="chalk">
    <div class="chalk-inner">
      <p class="eyebrow">Prototipo · foto a documento APA</p>
      <img src="/image/logo_imapaToPdf.svg" alt="Imapa.pdf" class="hero-logo" />
      <h1 class="headline">De tu cuaderno<br />al documento APA</h1>
      <p class="sub">
        Sacá una foto de tu cuestionario escrito a mano. La IA lee el título y
        la respuesta, y los convierte en un documento con formato APA 7 listo
        para subir a la plataforma.
      </p>

      <StepIndicator :step="step" :image-mode="imageMode" />

      <div class="upload-box" :class="{ 'has-image': paginas.length > 0 }">
        <label class="upload-label" @click.prevent="triggerFileInput">
          📷 Agregar fotos de páginas
        </label>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          multiple
          @change="handleFile"
        />
        <p class="upload-hint">
          Seleccioná una o varias fotos de tu cuestionario, en orden, y
          agregalas todas antes de leerlas.
        </p>

        <div v-if="paginas.length > 0" class="thumb-row">
          <div v-for="(p, i) in paginas" :key="i" class="thumb-item">
            <button
              class="thumb-remove"
              @click="emit('quitar', i)"
              title="Quitar"
            >
              ×
            </button>
            <img :src="p.previewUrl" />
            <span class="thumb-label">Página {{ i + 1 }}</span>
          </div>
        </div>

        <div>
          <div class="btn-row">
            <button
              class="btn-extract"
              :disabled="paginas.length === 0 || loading"
              @click="emit('leer')"
            >
              {{ loading ? "Leyendo..." : "Leer documento con IA →" }}
            </button>
            <button
              class="btn-image"
              :disabled="paginas.length === 0"
              @click="emit('modoImagen')"
            >
              Insertar imágenes en PDF
            </button>
          </div>
        </div>

        <p v-if="loading" class="status-line">
          Leyendo {{ paginas.length }} página(s)<span class="dots"></span>
        </p>
        <p v-if="error && !loading" class="status-line error">
          {{ error }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chalk {
  background:
    radial-gradient(
      circle at 20% 15%,
      rgba(255, 255, 255, 0.04),
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(255, 255, 255, 0.03),
      transparent 45%
    ),
    linear-gradient(180deg, var(--chalk-bg), var(--chalk-bg-deep));
  color: var(--chalk-white);
  padding: 48px 24px 64px;
  position: relative;
}
.chalk-inner {
  max-width: 720px;
  margin: 0 auto;
}
.eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--chalk-muted);
  margin: 0 0 14px;
}
.hero-logo {
  display: block;
  margin: 0 auto 16px;
  width: 80px;
  height: 80px;
  object-fit: cover;
  padding: 5sapx;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 10%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}
.headline {
  font-family: var(--hand);
  font-weight: 700;
  font-size: clamp(30px, 5vw, 44px);
  line-height: 1.15;
  margin: 0 0 10px;
}
.sub {
  color: var(--chalk-muted);
  font-size: 15px;
  line-height: 1.6;
  max-width: 540px;
  margin: 0 0 36px;
}
.upload-box {
  border: 2px dashed rgba(255, 255, 255, 0.28);
  border-radius: 14px;
  padding: 28px;
  text-align: center;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.upload-box.has-image {
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.18);
}
.upload-box input[type="file"] {
  display: none;
}
.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--pen-red);
  color: var(--chalk-white);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.03em;
  padding: 11px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.15s,
    transform 0.1s;
}
.upload-label:hover {
  background: var(--pen-red-dark);
}
.upload-label:active {
  transform: scale(0.97);
}
.upload-hint {
  font-size: 12.5px;
  color: var(--chalk-muted);
  margin-top: 12px;
}
.thumb-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
  justify-content: center;
  flex-wrap: wrap;
}
.thumb-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.thumb-item img {
  max-height: 110px;
  border-radius: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}
.thumb-label {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--chalk-muted);
}
.thumb-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--pen-red);
  color: #fff;
  border: none;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  font-family: var(--mono);
}
.btn-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}
.btn-extract {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--chalk-white);
  color: var(--chalk-bg-deep);
  font-family: var(--mono);
  font-weight: 500;
  font-size: 13.5px;
  border: none;
  border-radius: 8px;
  padding: 12px 22px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.15s;
}
.btn-extract:hover {
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.18);
}
.btn-extract:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-extract:active {
  transform: scale(0.97);
}
.btn-image {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--chalk-white);
  font-family: var(--mono);
  font-weight: 500;
  font-size: 13.5px;
  border: 2px solid var(--chalk-white);
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.15s;
}
.btn-image:hover {
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.18);
}
.btn-image:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-image:active {
  transform: scale(0.97);
}
.status-line {
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--chalk-muted);
  margin-top: 16px;
  min-height: 18px;
}
.status-line.error {
  color: #e8a39c;
}
.dots::after {
  content: "";
  animation: dotting 1.2s steps(4, end) infinite;
}
@keyframes dotting {
  0%,
  20% {
    content: ".";
  }
  40% {
    content: "..";
  }
  60% {
    content: "...";
  }
  80%,
  100% {
    content: "";
  }
}
</style>
