import type { AppSetup } from '@slidev/types'

import './deck.css'

/**
 * 通用放大 overlay
 */
function useZoomOverlay() {
  let zoomOverlay: HTMLElement | null = null

  function remove() {
    if (zoomOverlay) {
      zoomOverlay.remove()
      zoomOverlay = null
    }
  }

  function show(contentHtml: string, className = '') {
    if (zoomOverlay)
      return

    zoomOverlay = document.createElement('div')
    zoomOverlay.className = `deck-zoom-overlay ${className}`.trim()
    zoomOverlay.innerHTML = `<div class="deck-zoom-overlay__content">${contentHtml}</div>`

    zoomOverlay.addEventListener('click', (e) => {
      const content = zoomOverlay!.querySelector('.deck-zoom-overlay__content')
      if (e.target === zoomOverlay || !content?.contains(e.target as Node))
        remove()
    })

    document.body.appendChild(zoomOverlay)

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        remove()
        document.removeEventListener('keydown', keyHandler)
      }
    }
    document.addEventListener('keydown', keyHandler)
  }

  return { show, remove }
}

/**
 * Mermaid 交互增强
 * 1. 修复 ShadowRoot 内 SVG 可能越界的问题（注入 max-width: 100% 样式）
 * 2. 双击 Mermaid 图弹出全屏 overlay 放大查看
 */
function initMermaidInteractions() {
  if (typeof document === 'undefined')
    return

  const { show: showZoom } = useZoomOverlay()

  function setupMermaid(el: HTMLElement) {
    if (el.dataset.mermaidSetup)
      return
    el.dataset.mermaidSetup = 'true'

    const shadow = el.shadowRoot
    if (!shadow)
      return

    /* ── 1. 注入 ShadowRoot 内部样式，防止 SVG 越界 ── */
    const injectStyle = () => {
      if (shadow.querySelector('style[data-mermaid-fix]'))
        return
      const style = document.createElement('style')
      style.dataset.mermaidFix = ''
      style.textContent = `
        svg {
          max-width: 100% !important;
          height: auto !important;
        }
      `
      shadow.appendChild(style)
    }

    const mo = new MutationObserver(() => {
      if (shadow.querySelector('svg')) {
        injectStyle()
        mo.disconnect()
      }
    })
    mo.observe(shadow, { childList: true })

    if (shadow.querySelector('svg'))
      injectStyle()

    /* ── 2. 单击放大 ── */
    el.addEventListener('click', () => {
      const svg = shadow.querySelector('svg')
      if (!svg)
        return
      showZoom(svg.outerHTML, 'deck-zoom-overlay--mermaid')
    })
  }

  document.querySelectorAll('.mermaid').forEach(el =>
    setupMermaid(el as HTMLElement),
  )

  const bodyMo = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          if (node.classList.contains('mermaid'))
            setupMermaid(node)
          node.querySelectorAll('.mermaid').forEach(el =>
            setupMermaid(el as HTMLElement),
          )
        }
      }
    }
  })
  bodyMo.observe(document.body, { childList: true, subtree: true })
}

// Load deck-wide CSS outside slide templates to avoid Vue SFC side-effect tag errors.
const setupMain: AppSetup = () => {
  initMermaidInteractions()
}

export default setupMain
