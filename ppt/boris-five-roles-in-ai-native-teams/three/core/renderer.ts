import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import type { WaveGridEngine } from './waveGridEngine'
import { VignetteRGBShiftShader } from '../effects/vignetteRGBShiftShader'

/**
 * WebGL 渲染器 + 后处理链。
 *
 * 链路：`RenderPass`（场景→缓冲）→ `VignetteRGBShift`（暗角 + RGB 色散）→
 * `OutputPass`（色彩空间转换）。`update()` 经 composer 渲染。
 */
export class Renderer {
  instance: THREE.WebGLRenderer
  private readonly composer: EffectComposer
  /** 暴露给 Stage.setGUI 调参（暗角/色散） */
  readonly vignettePass: ShaderPass

  constructor(private readonly engine: WaveGridEngine) {
    const { canvas, sizes, scene, camera } = engine
    // preserveDrawingBuffer: true 让 WebGL drawing buffer 帧间不清空，
    // slidev export（playwright 截图）才能读到已渲染画面，否则截图瞬间 buffer 被清空 → 白屏
    this.instance = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true })
    this.instance.toneMapping = THREE.ACESFilmicToneMapping
    this.instance.toneMappingExposure = 1.2
    this.instance.shadowMap.enabled = true
    // PCFSoftShadowMap 自 r182 弃用；PCFShadowMap 是现代写法
    this.instance.shadowMap.type = THREE.PCFShadowMap
    this.instance.setClearColor('#eef2f7')
    this.instance.setSize(sizes.width, sizes.height)
    this.instance.setPixelRatio(sizes.pixelRatio)

    this.composer = new EffectComposer(this.instance)
    this.composer.addPass(new RenderPass(scene, camera.instance))
    this.vignettePass = new ShaderPass(VignetteRGBShiftShader)
    this.vignettePass.uniforms.shiftAmount!.value = 0.003
    this.vignettePass.uniforms.vignetteRadius!.value = 0.3
    this.vignettePass.uniforms.vignetteSoftness!.value = 0.3
    this.composer.addPass(this.vignettePass)
    this.composer.addPass(new OutputPass())
  }

  resize(): void {
    const { sizes } = this.engine
    this.instance.setSize(sizes.width, sizes.height)
    this.instance.setPixelRatio(sizes.pixelRatio)
    this.composer.setSize(sizes.width, sizes.height)
    this.composer.setPixelRatio(sizes.pixelRatio)
  }

  update(): void {
    this.composer.render()
  }

  dispose(): void {
    this.composer.dispose()
    this.instance.dispose()
  }
}
