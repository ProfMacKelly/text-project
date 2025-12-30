<template>
  <div class="relative">
    <!-- Debug badge: MUST change when keys work -->
    <div
      class="fixed right-4 top-4 z-50 rounded px-2 py-1 text-sm bg-black/60 text-white select-none"
    >
      zoom {{ scale.toFixed(2) }} · x {{ panX }} · y {{ panY }}
      <span class="ml-2 opacity-80">(+/- , Shift+Arrows, 0)</span>
    </div>

    <div class="origin-top-left" :style="styleObj">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const scale = ref(1)
const panX = ref(0)
const panY = ref(0)

const zoomStep = 0.1
const panStep = 40

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function isPresenter() {
  return location.pathname.includes('/presenter')
}

function isTypingTarget(el: EventTarget | null) {
  const t = el as HTMLElement | null
  if (!t) return false
  const tag = t.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || (t as any).isContentEditable
}

function onKeydown(e: KeyboardEvent) {
  if (!isPresenter()) return
  if (isTypingTarget(e.target)) return

  let handled = false

  // Zoom: use "+" and "-" via key value (works across many layouts)
  // On US keyboards "+" is Shift+"=" but e.key will be "+"
  if (e.key === '+') {
    scale.value = clamp(scale.value + zoomStep, 0.5, 3)
    handled = true
  }
  if (e.key === '-') {
    scale.value = clamp(scale.value - zoomStep, 0.5, 3)
    handled = true
  }

  // Reset
  if (e.key === '0') {
    scale.value = 1
    panX.value = 0
    panY.value = 0
    handled = true
  }

  // Pan: Shift + Arrows
  if (e.shiftKey && e.key === 'ArrowLeft') {
    panX.value -= panStep
    handled = true
  }
  if (e.shiftKey && e.key === 'ArrowRight') {
    panX.value += panStep
    handled = true
  }
  if (e.shiftKey && e.key === 'ArrowUp') {
    panY.value -= panStep
    handled = true
  }
  if (e.shiftKey && e.key === 'ArrowDown') {
    panY.value += panStep
    handled = true
  }

  if (handled) {
    e.preventDefault()
    e.stopPropagation()
  }
}

onMounted(() => {
  // Capture at window level so it works even if focus is finicky
  window.addEventListener('keydown', onKeydown, { capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown, { capture: true } as any)
})

const styleObj = computed(() => {
  const s = scale.value
  return {
    transform: `translate(${panX.value}px, ${panY.value}px) scale(${s})`,
    width: s > 1 ? `${100 / s}%` : '100%',
    height: s > 1 ? `${100 / s}%` : '100%',
  } as Record<string, string>
})
</script>
