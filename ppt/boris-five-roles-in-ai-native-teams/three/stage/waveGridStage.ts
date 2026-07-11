import * as THREE from 'three'
import GUI from 'lil-gui'
import type { WaveGridEngine } from '../core/waveGridEngine'
import type { WaveParams, TrailOptions } from '../types'
import { DEFAULT_WAVE_PARAMS } from '../types'
import { MouseTrail } from '../effects/mouseTrail'
import {
  waveFragmentColor,
  waveFragmentDeclarations,
  waveVertexDeclarations,
  waveVertexDisplacement,
} from './waveShaderChunks'

/**
 * 波浪立方体网格舞台。
 *
 * - S2：`onBeforeCompile` 注入波浪 vertex/fragment shader；顶点由 MouseTrail 的
 *   DataTexture 驱动；`customDepthMaterial` 复用同一 vertex shader 保证阴影一致。
 * - S3：可调光照系统（ambient + 主光投影 + 填充光），PCFShadowMap 阴影。
 * - S4：`setGUI` 把波浪/光照/后处理参数绑到 lil-gui（仅 #debug），onChange 即时同步。
 */
export class WaveGridStage {
  readonly bounds: number
  readonly params: WaveParams = { ...DEFAULT_WAVE_PARAMS }
  readonly mouseTrail: MouseTrail

  private readonly mesh: THREE.InstancedMesh
  private offsetAttribute!: THREE.InstancedBufferAttribute
  private readonly ambient: THREE.AmbientLight
  private readonly keyLight: THREE.DirectionalLight
  private readonly fillLight: THREE.DirectionalLight
  // 持 material uniform 引用，GUI 调参时即时同步（外部审查 P3 前向提醒）
  private shaderRef: THREE.WebGLProgramParametersWithUniforms | null = null
  // uIdleTime 主 shader 与 depth shader 共享同一对象：每帧变化须两处同步，否则阴影与可见波形错位
  private readonly sharedIdleTime = { value: 0 }

  constructor(
    private readonly engine: WaveGridEngine,
    trailOptions: TrailOptions = {},
  ) {
    const p = this.params
    this.bounds = p.gridSize * (p.cubeWidth + p.gap)

    // MouseTrail 须在 setGrid 前构造：onBeforeCompile 引用其 uniforms
    this.mouseTrail = new MouseTrail(this.engine, this.bounds, {}, Math.random, trailOptions)

    const { scene } = this.engine
    // 背景取基色的一半亮度，避免抢戏
    scene.background = new THREE.Color(p.colorBase).multiplyScalar(0.92)

    this.ambient = new THREE.AmbientLight(0xffffff, 1)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 5.3)
    this.keyLight.position.set(-10, 10, 6)
    // 主光投影：阴影随波浪抬升（customDepthMaterial 复用 wave vertex shader）
    this.keyLight.castShadow = true
    this.keyLight.shadow.mapSize.set(1024, 1024)
    this.keyLight.shadow.radius = 6
    this.keyLight.shadow.camera.near = 0.1
    this.keyLight.shadow.camera.far = 60
    this.keyLight.shadow.camera.left = -22
    this.keyLight.shadow.camera.right = 22
    this.keyLight.shadow.camera.top = 22
    this.keyLight.shadow.camera.bottom = -22
    this.keyLight.shadow.bias = 0.0001

    // 填充光：不投影，补暗部
    this.fillLight = new THREE.DirectionalLight(0xffffff, 1.25)
    this.fillLight.position.set(10, 5, -3)

    this.mesh = this.createGrid()
    this.layoutGrid()
    scene.add(this.ambient, this.keyLight, this.fillLight, this.mesh)
  }

  private createGrid(): THREE.InstancedMesh {
    const p = this.params
    const count = p.gridSize * p.gridSize
    const geometry = new THREE.BoxGeometry(p.cubeWidth, p.cubeHeight, p.cubeWidth)

    // 每实例 XZ 世界坐标，传给 vertex shader
    this.offsetAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(count * 2),
      2,
    )
    geometry.setAttribute('aOffset', this.offsetAttribute)

    const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    material.onBeforeCompile = (shader) => {
      this.attachWaveUniforms(shader.uniforms, p)
      shader.vertexShader = this.injectVertex(shader.vertexShader)
      shader.fragmentShader = this.injectFragment(shader.fragmentShader)
      this.shaderRef = shader
    }

    // depth pass 复用同一 vertex shader，使阴影随波浪抬升
    const depthMaterial = new THREE.MeshDepthMaterial()
    depthMaterial.onBeforeCompile = (shader) => {
      this.attachWaveUniforms(shader.uniforms, p)
      shader.vertexShader = this.injectVertex(shader.vertexShader)
    }

    const mesh = new THREE.InstancedMesh(geometry, material, count)
    mesh.customDepthMaterial = depthMaterial
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  /** 把 MouseTrail 的共享 uniform + 波浪参数 uniform 挂到 shader。 */
  private attachWaveUniforms(
    uniforms: THREE.WebGLProgramParametersWithUniforms['uniforms'],
    p: WaveParams,
  ): void {
    const mu = this.mouseTrail.uniforms
    // trail 相关：按引用共享，MouseTrail.update 的改动每帧自动反映
    uniforms.uTrailTexture = mu.uTrailTexture
    uniforms.uTrailCount = mu.uTrailCount
    uniforms.uFadeTime = mu.uFadeTime
    // 波浪参数
    uniforms.uWaveSpeed = { value: p.waveSpeed }
    uniforms.uWaveFreq = { value: p.waveFrequency }
    uniforms.uWaveWidth = { value: p.waveWidth }
    uniforms.uAmplitude = { value: p.waveAmplitude }
    uniforms.uJitter = { value: p.waveJitter }
    uniforms.uMaxHeight = { value: p.waveMaxHeight }
    uniforms.uColorBase = { value: new THREE.Color(p.colorBase) }
    uniforms.uColorHigh = { value: new THREE.Color(p.colorHigh) }
    // per-instance 呼吸：uIdleTime 每帧变，须主/depth shader 共享同一对象；Amp/Freq 静态值即可
    uniforms.uIdleTime = this.sharedIdleTime
    uniforms.uIdleAmp = { value: p.idleAmp }
    uniforms.uIdleFreq = { value: p.idleFreq }
  }

  private injectVertex(vs: string): string {
    return vs
      .replace(
        '#include <common>',
        `#include <common>\n${waveVertexDeclarations}`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>\n${waveVertexDisplacement}`,
      )
  }

  private injectFragment(fs: string): string {
    return fs
      .replace(
        '#include <common>',
        `#include <common>\n${waveFragmentDeclarations}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>\n${waveFragmentColor}`,
      )
  }

  private layoutGrid(): void {
    const p = this.params
    const dummy = new THREE.Object3D()
    const spacing = p.cubeWidth + p.gap
    const offset = ((p.gridSize - 1) * spacing) / 2
    for (let i = 0; i < p.gridSize; i++) {
      for (let j = 0; j < p.gridSize; j++) {
        const index = i * p.gridSize + j
        const x = i * spacing - offset
        const z = j * spacing - offset
        dummy.position.set(x, 0, z)
        dummy.updateMatrix()
        this.mesh.setMatrixAt(index, dummy.matrix)
        this.offsetAttribute.setXY(index, x, z)
      }
    }
    this.mesh.instanceMatrix.needsUpdate = true
    this.offsetAttribute.needsUpdate = true
  }

  /**
   * 绑定调参面板（仅 #debug 时由 engine 调用）。
   * onChange 同步到 shader uniform（shaderRef）、光照与后处理实例。
   */
  setGUI(gui: GUI): void {
    const p = this.params
    const setU = (uniform: string) => (v: number) => {
      if (this.shaderRef) {
        ;(this.shaderRef.uniforms[uniform] as { value: number }).value = v
      }
    }
    gui
      .add(p, 'waveAmplitude', 0, 2, 0.01)
      .name('振幅')
      .onChange(setU('uAmplitude'))
    gui.add(p, 'waveSpeed', 1, 20, 0.1).name('波速').onChange(setU('uWaveSpeed'))
    gui
      .add(p, 'waveFrequency', 0.1, 5, 0.05)
      .name('频率')
      .onChange(setU('uWaveFreq'))
    gui
      .add(p, 'waveWidth', 0.5, 10, 0.1)
      .name('波宽')
      .onChange(setU('uWaveWidth'))
    gui.addColor(p, 'colorHigh').name('波峰色').onChange((v: string) => {
      if (this.shaderRef) {
        ;(this.shaderRef.uniforms.uColorHigh as { value: THREE.Color }).value.set(
          v,
        )
      }
    })
    gui.add(this.keyLight, 'intensity', 0, 10, 0.1).name('主光强度')
    const vp = this.engine.renderer.vignettePass.uniforms
    gui.add(vp.shiftAmount!, 'value', 0, 0.02, 0.001).name('色散')
    gui.add(vp.vignetteRadius!, 'value', 0, 1, 0.01).name('暗角半径')
  }

  update(delta: number): void {
    this.sharedIdleTime.value += delta
    this.mouseTrail.update(delta)
  }

  dispose(): void {
    const { scene } = this.engine
    scene.remove(this.mesh, this.ambient, this.keyLight, this.fillLight)
    this.mesh.geometry.dispose()
    const mat = this.mesh.material
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
    else mat.dispose()
    this.mesh.customDepthMaterial?.dispose()
    this.mouseTrail.dispose()
  }
}
