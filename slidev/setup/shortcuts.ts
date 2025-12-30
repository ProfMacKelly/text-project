import { defineShortcutsSetup } from '@slidev/types'
import type { NavOperations, ShortcutOptions } from '@slidev/types'

declare global {
  interface Window {
    __presenterZoom?: number
    __presenterPanX?: number
    __presenterPanY?: number
    __presenterZoomPanBound?: boolean
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function emit() {
  window.dispatchEvent(new CustomEvent('slidev:presenter-zoompan'))
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

export default defineShortcutsSetup((_nav: NavOperations, base: ShortcutOptions[]) => {
  if (!window.__presenterZoomPanBound) {
    window.__presenterZoomPanBound = true

    if (window.__presenterZoom == null) window.__presenterZoom = 1
    if (window.__presenterPanX == null) window.__presenterPanX = 0
    if (window.__presenterPanY == null) window.__presenterPanY = 0

    const zoomStep = 0.1
    const panStep = 40

    window.addEventListener(
      'keydown',
      (e) => {
        if (!isPresenter()) return
        if (isTypingTarget(e.target)) return

        let handled = false

        // Zoom in: either the physical "=" key (code Equal),
        // or "+" on layouts where "+" is Shift+"=" (still code Equal but shiftKey true)
        if (e.code === 'Equal') {
          window.__presenterZoom = clamp((window.__presenterZoom ?? 1) + zoomStep, 0.5, 3)
          handled = true
        }

        // Zoom out: physical "-" key
        if (e.code === 'Minus') {
          window.__presenterZoom = clamp((window.__presenterZoom ?? 1) - zoomStep, 0.5, 3)
          handled = true
        }

        // Reset: "0"
        if (e.code === 'Digit0') {
          window.__presenterZoom = 1
          window.__presenterPanX = 0
          window.__presenterPanY = 0
          handled = true
        }

        // Pan: Shift + Arrow keys
        if (e.shiftKey && e.code === 'ArrowLeft') {
          window.__presenterPanX = (window.__presenterPanX ?? 0) - panStep
          handled = true
        }
        if (e.shiftKey && e.code === 'ArrowRight') {
          window.__presenterPanX = (window.__presenterPanX ?? 0) + panStep
          handled = true
        }
        if (e.shiftKey && e.code === 'ArrowUp') {
          window.__presenterPanY = (window.__presenterPanY ?? 0) - panStep
          handled = true
        }
        if (e.shiftKey && e.code === 'ArrowDown') {
          window.__presenterPanY = (window.__presenterPanY ?? 0) + panStep
          handled = true
        }

        if (handled) {
          e.preventDefault()
          emit()
        }
      },
      { capture: true },
    )
  }

  return [...base]
})
