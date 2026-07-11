/**
 * 把 devicePixelRatio 限制到 `max`，避免高 DPI 设备（如 Retina 3x、手机 4x）
 * 因像素填充率过高而掉帧。抽出为纯函数便于单测。
 */
export function capPixelRatio(dpr: number, max = 2): number {
  return Math.min(dpr, max)
}

/**
 * 视口尺寸与像素比。
 *
 * 框架无关（只依赖浏览器 `window`）。resize 时通过 `listener` 回调通知
 * 而非事件总线——依赖注入下，engine 直接把自身 `resize()` 作为回调传入，
 * 无需 mitt 之类的中间层。
 */
export class Sizes {
  width: number
  height: number
  pixelRatio: number

  private readonly onResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = capPixelRatio(window.devicePixelRatio)
    this.listener()
  }

  constructor(private readonly listener: () => void) {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = capPixelRatio(window.devicePixelRatio)
    window.addEventListener('resize', this.onResize)
  }

  dispose(): void {
    window.removeEventListener('resize', this.onResize)
  }
}
