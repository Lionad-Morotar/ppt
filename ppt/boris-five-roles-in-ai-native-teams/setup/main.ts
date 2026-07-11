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

/**
 * 立方体波浪背景（跨页全局常驻）。
 * 为什么不用每页 layout：背景要跨页连续、立方体不重建，故挂全局 fixed canvas。
 * - 动态 import three → SSR 安全（Slidev build 不触 WebGL）
 * - PPT 模式：mouseEnabled=false（静止无鼠标交互）、idleMode=sleep（无随机波）
 * - 挂 canvas + 半透明遮罩到 body，z-index 在 Slidev 内容之下
 * - engine 存 window.__deckBg，供翻页波纹组件（S2）调用
 */
/**
 * PPT 背景行为：首屏中心绽放 + 翻页方向波纹 + 按页型分治的随机波纹。
 * - 翻页：三重信号（劫持 pushState/replaceState 覆盖 history 路由 + popstate + hashchange 兜底）
 * - 页型分治：首页持续随机波纹（F3），普通页静止（F4），翻页瞬间一律触发过渡波纹（F1）
 * 依赖 engine.stage.mouseTrail 的 addPoint / addRandomPoint（sleep 模式下唯一驱动波纹的入口）。
 */
function startWaveBehavior(
  engine: {
    stage: {
      mouseTrail: {
        addPoint: (x: number, z: number, d: number, fastDecay?: boolean) => void
        addRandomPoint: () => void
      }
      bounds: number
    }
  },
  // 调试探针：按页型开关 cmd/ctrl 高亮（仅首页激活）
  inspector: { setActive(enabled: boolean): void },
) {
  const trail = engine.stage.mouseTrail
  const bounds = engine.stage.bounds

  // 首屏中心绽放：同心圆点 + 中心强点（开场）
  const bloom = () => {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      const r = bounds * 0.16
      trail.addPoint(Math.cos(a) * r, Math.sin(a) * r, 2.0)
    }
    trail.addPoint(0, 0, 2.5)
  }

  // 首页持续随机波纹：随机间隔 1.5~3s 主动 addRandomPoint（setTimeout 递归，比固定 setInterval 更自然）；普通页停定时器保持静止
  let homeTimer: number | null = null
  const startHomeRipple = () => {
    if (homeTimer !== null)
      return
    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 3000 // 3~6s 随机
      homeTimer = window.setTimeout(() => {
        trail.addRandomPoint()
        scheduleNext()
      }, delay)
    }
    scheduleNext()
  }
  const stopHomeRipple = () => {
    if (homeTimer !== null) {
      clearTimeout(homeTimer)
      homeTimer = null
    }
  }

  // 当前页号：兼容 hash（#/N）与 history（/N）两种 Slidev 路由模式
  const currentPage = (): number => {
    const m = (location.hash || location.pathname).match(/(\d+)/)
    return m ? Number.parseInt(m[1], 10) : 1
  }

  // canvas（立方体背景层）按页型：封面 opacity 1 不变，正文/尾页 0.85 稍透（立方体变淡、透白底，不显灰）
  // 实时 querySelector：startWaveBehavior 调用时 canvas 可能尚未挂载，闭包捕获会拿到 null 永不更新
  const updateBg = (page: number) => {
    const c = document.querySelector('.deck-bg-canvas') as HTMLCanvasElement | null
    if (c)
      c.style.opacity = page === 1 ? '1' : '0.85'
  }

  bloom()

  let lastPage = currentPage()
  updateBg(lastPage)
  inspector.setActive(lastPage === 1)
  // 首屏若已在首页，启动持续随机波纹
  if (lastPage === 1)
    startHomeRipple()

  // 翻页回调：按页型切换 veil + 随机波纹（翻页本身不再触发背景波纹，避免干扰视线）
  const onNav = () => {
    const page = currentPage()
    if (page === lastPage)
      return
    const forward = page > lastPage
    lastPage = page
    // 翻页 ripple：下一页在画面右侧中心点一颗，上一页在左侧中心（bounds*0.45 落在立方体阵列右/左边缘内）
    trail.addPoint(forward ? bounds * 0.45 : -bounds * 0.45, 0, 1.8, true)
    updateBg(page)
    inspector.setActive(page === 1)
    if (page === 1)
      startHomeRipple()
    else
      stopHomeRipple()
  }

  // 三重翻页信号：Slidev 路由模式由编译期常量 __SLIDEV_HASH_ROUTE__ 决定，
  // 劫持 pushState/replaceState 覆盖 history 模式翻页，popstate/hashchange 兜底两种模式。
  // bind(history) 固定原生 this；箭头包装注入 onNav，cast 回原签名保证赋值类型合法。
  const origPush = history.pushState.bind(history)
  const origReplace = history.replaceState.bind(history)
  history.pushState = ((...args: Parameters<History['pushState']>) => {
    origPush(...args)
    onNav()
  }) as History['pushState']
  history.replaceState = ((...args: Parameters<History['replaceState']>) => {
    origReplace(...args)
    onNav()
  }) as History['replaceState']
  window.addEventListener('popstate', onNav)
  window.addEventListener('hashchange', onNav)
}

async function initWaveBackground() {
  if (typeof window === 'undefined')
    return
  const { WaveGridEngine, CubeInspector } = await import('../three')
  const canvas = document.createElement('canvas')
  canvas.className = 'deck-bg-canvas'
  const veil = document.createElement('div')
  veil.className = 'deck-bg-veil'
  const mount = () => {
    document.body.append(canvas, veil)
    const engine = new WaveGridEngine(canvas, { mouseEnabled: false, idleMode: 'sleep' })
    ;(window as unknown as { __deckBg?: unknown }).__deckBg = engine
    // 调试探针：按住 cmd/ctrl 高亮鼠标所在方块并输出坐标，仅首页激活（setActive 由 startWaveBehavior 按页型切换）
    const inspector = new CubeInspector(engine)
    // 暴露到 window 供 console 手动探查（与 __deckBg 同一调试入口）
    ;(window as unknown as { __deckInspector?: unknown }).__deckInspector = inspector
    startWaveBehavior(engine, inspector)
  }
  if (document.body)
    mount()
  else
    document.addEventListener('DOMContentLoaded', mount, { once: true })
}

const setupMain: AppSetup = () => {
  initMermaidInteractions()
  initWaveBackground()
}

export default setupMain
