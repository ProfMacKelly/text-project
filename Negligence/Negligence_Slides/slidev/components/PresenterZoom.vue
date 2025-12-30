<template>
  <div
    class="origin-top-left"
    :style="{
      transform: `scale(${scale})`,
      width: scale >= 1 ? `${100 / scale}%` : '100%',
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

declare global {
  interface Window {
    __presenterZoom?: number
  }
}

const scale = ref(1)

const sync = () => {
  scale.value = window.__presenterZoom ?? 1
}

onMounted(() => {
  sync()
  window.addEventListener('slidev:presenter-zoom', sync)
})

onBeforeUnmount(() => {
  window.removeEventListener('slidev:presenter-zoom', sync)
})
</script>
