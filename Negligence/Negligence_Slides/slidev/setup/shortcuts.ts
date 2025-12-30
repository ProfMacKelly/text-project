// ---------------------------
// File: setup/shortcuts.ts
// ---------------------------
import type { NavOperations, ShortcutOptions } from '@slidev/types'
import { defineShortcutsSetup } from '@slidev/types'
import { useNav } from '@slidev/client'

declare global {
  interface Window {
    __presenterZoom?: number
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default defineShortcutsSetup((nav: NavOperations, base: ShortcutOptions[]) => {
  // Detect presenter mode (same pattern as docs show with useNav().isPresenter)
  const { isPresenter } = useNav()

  const emit = () => window.dispatchEvent(new CustomEvent('slidev:presenter-zoom'))

  const setZoom = (next: number) => {
    window.__presenterZoom = clamp(next, 0.5, 3)
    emit()
  }

  // Initialize once (safe if it runs multiple times)
  if (window.__presenterZoom == null) window.__presenterZoom = 1

  return [
    ...base, // keep existing shortcuts

    // Zoom in
    {
      key: '=',
      fn: () => {
        if (!isPresenter.value) return
        setZoom((window.__presenterZoom ?? 1) + 0.1)
      },
      autoRepeat: true,
    },

    // Zoom out
    {
      key: '9',
      fn: () => {
        if (!isPresenter.value) return
        setZoom((window.__presenterZoom ?? 1) - 0.1)
      },
      autoRepeat: true,
    },

    // Reset zoom
    {
      key: '0',
      fn: () => {
        if (!isPresenter.value) return
        setZoom(1)
      },
    },
  ]
})

