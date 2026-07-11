import GUI from 'lil-gui'

/**
 * `#debug` hash 激活 lil-gui 调试面板。
 *
 * 引擎核心**不依赖**此模块——仅当 active 时才创建 GUI。迁移到不需要
 * 调试面板的项目时，整个 Debug 可移除而不影响渲染。
 */
export class Debug {
  readonly active: boolean
  readonly ui: GUI | null

  constructor() {
    this.active =
      typeof window !== 'undefined' && window.location.hash === '#debug'
    this.ui = this.active ? new GUI() : null
  }

  dispose(): void {
    this.ui?.destroy()
  }
}
