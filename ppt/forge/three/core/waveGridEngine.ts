import * as THREE from 'three'
import { Debug } from './debug'
import { Sizes } from './sizes'
import { Camera } from './camera'
import { Renderer } from './renderer'
import { WaveGridStage } from '../stage/waveGridStage'
import type { TrailOptions } from '../types'

/**
 * 波浪网格引擎——依赖注入容器，替代源仓库的 class 单例 Orchestrator。
 *
 * 构造时按依赖顺序实例化各模块并把自身引用传入；子模块通过 `engine.sizes`、
 * `engine.scene` 等拿共享状态，不再隐式取全局。框架无关：整个 `three/` 目录
 * 可整体拷贝到任意项目（React / 原生），只需在外部写几行挂载代码。
 */
export class WaveGridEngine {
  readonly canvas: HTMLCanvasElement
  readonly debug: Debug
  readonly sizes: Sizes
  readonly scene: THREE.Scene
  readonly camera: Camera
  readonly renderer: Renderer
  readonly stage: WaveGridStage
  private readonly clock: THREE.Timer

  constructor(
    canvas: HTMLCanvasElement,
    readonly trailOptions: TrailOptions = {},
  ) {
    this.canvas = canvas
    this.debug = new Debug()
    // resize 回调直接注入 engine.resize，省去 mitt 事件总线
    this.sizes = new Sizes(() => this.resize())
    this.scene = new THREE.Scene()
    // Timer 配合 Page Visibility API，后台 tab 不产生巨大 delta 跳变
    this.clock = new THREE.Timer()
    this.clock.connect(document)

    // 顺序敏感：camera/renderer/stage 依赖 sizes 与 scene
    this.camera = new Camera(this)
    this.renderer = new Renderer(this)
    this.stage = new WaveGridStage(this, this.trailOptions)
    // #debug 时绑定 lil-gui 调参面板
    if (this.debug.active && this.debug.ui) this.stage.setGUI(this.debug.ui)

    this.renderer.instance.setAnimationLoop(this.animate)
  }

  private resize(): void {
    this.camera.resize()
    this.renderer.resize()
  }

  // 箭头属性自动绑定 this，便于传给 setAnimationLoop
  private readonly animate = (): void => {
    this.clock.update()
    const delta = this.clock.getDelta()
    this.camera.update(delta)
    this.stage.update(delta)
    this.renderer.update()
  }

  dispose(): void {
    this.renderer.instance.setAnimationLoop(null)
    this.clock.disconnect()
    this.clock.dispose()
    this.stage.dispose()
    this.camera.dispose()
    this.renderer.dispose()
    this.sizes.dispose()
    this.debug.dispose()
  }
}
