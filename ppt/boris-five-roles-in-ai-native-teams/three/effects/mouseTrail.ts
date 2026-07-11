import * as THREE from 'three'
import type { WaveGridEngine } from '../core/waveGridEngine'
import { MAX_TRAIL } from '../types'
import type { TrailPoint, TrailOptions } from '../types'

// re-export 供测试与外部消费；单一来源在 types.ts
export { MAX_TRAIL }

export interface MouseTrailParams {
  /** 振幅衰减到 ~37% 的秒数（指数衰减时间常数） */
  fadeTime: number
  /** 相邻轨迹点的最小世界单位距离；小于此间距不采样，避免密集点堆积 */
  trailSpacing: number
}

export interface MouseTrailUniforms {
  uTrailTexture: { value: THREE.DataTexture }
  uTrailCount: { value: number }
  uFadeTime: { value: number }
}

/**
 * 把鼠标在世界平面的移动采样为最多 MAX_TRAIL 个点，每帧编码为
 * `DataTexture(MAX_TRAIL×1, RGBA float)`，每个 texel = (worldX, worldZ, age, distDelta)。
 * vertex shader 读此纹理为每个立方体顶点叠加波浪贡献。
 *
 * 框架无关；`random` 可注入以便单测。鼠标静止时自动在中心区域生成随机触点，
 * 保证画面永不静止。
 */
export class MouseTrail {
  readonly params: MouseTrailParams
  readonly uniforms: MouseTrailUniforms
  readonly trail: TrailPoint[] = []

  private lastPoint: { x: number; z: number } | null = null
  private timeSinceLastMove = 0
  private randomPointTimer = 0
  /** 初始即随机模式：页面打开就有波，无需等鼠标 */
  private isPlacingRandomPoints = true
  private readonly randomStrength = 0.8
  private readonly mouseEnabled: boolean
  private readonly idleMode: 'random' | 'sleep'

  private readonly mouseCoords = new THREE.Vector2()
  private readonly raycaster = new THREE.Raycaster()
  private readonly rayPlane: THREE.Mesh
  private readonly trailData: Float32Array
  private readonly trailTexture: THREE.DataTexture
  // 缓存 canvas 矩阵：pointermove 高频路径上避免每次触发 layout reflow（外部审查 P1）
  private rect: DOMRect
  private readonly onResize: () => void
  private readonly onPointerMove: (e: PointerEvent) => void

  constructor(
    private readonly engine: WaveGridEngine,
    private readonly bounds: number,
    params: Partial<MouseTrailParams> = {},
    private readonly random: () => number = Math.random,
    options: TrailOptions = {},
  ) {
    this.params = { fadeTime: 2.0, trailSpacing: 0.1, ...params }
    this.mouseEnabled = options.mouseEnabled ?? true
    this.idleMode = options.idleMode ?? 'random'
    // sleep 模式初始即静止，不放随机点
    this.isPlacingRandomPoints = this.idleMode === 'random' && this.isPlacingRandomPoints

    // 不可见水平面：把指针 NDC → 世界坐标（raycast 命中点）
    this.rayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds, bounds),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false }),
    )
    this.rayPlane.rotation.x = -Math.PI / 2
    this.rayPlane.updateMatrixWorld(true)

    this.trailData = new Float32Array(MAX_TRAIL * 4)
    this.trailTexture = new THREE.DataTexture(
      this.trailData,
      MAX_TRAIL,
      1,
      THREE.RGBAFormat,
      THREE.FloatType,
    )
    this.trailTexture.needsUpdate = true

    this.uniforms = {
      uTrailTexture: { value: this.trailTexture },
      uTrailCount: { value: 0 },
      uFadeTime: { value: this.params.fadeTime },
    }

    this.rect = engine.canvas.getBoundingClientRect()
    this.onResize = () => {
      this.rect = engine.canvas.getBoundingClientRect()
    }
    window.addEventListener('resize', this.onResize)

    this.onPointerMove = (e) => this.handlePointerMove(e)
    // mouseEnabled=false（PPT 背景模式）不绑 pointermove，静止无鼠标交互
    if (this.mouseEnabled) {
      engine.canvas.addEventListener('pointermove', this.onPointerMove)
    }
  }

  /** 直接加一个轨迹点（绕过 raycast 与采样剔除），供测试与外部触发。 */
  addPoint(x: number, z: number, distDelta: number, fastDecay = false): void {
    if (this.trail.length >= MAX_TRAIL) this.trail.shift()
    this.trail.push({ x, z, age: 0, distDelta, fastDecay })
  }

  /** 鼠标静止时在中心区域随机生成触点，保证画面始终有波。 */
  addRandomPoint(): void {
    const x = (this.random() * 0.5 - 0.25) * this.bounds
    const z = (this.random() * 0.5 - 0.25) * this.bounds
    const distDelta = this.randomStrength + this.random() * 0.2
    this.addPoint(x, z, distDelta)
  }

  /** 每帧：age 增长、过期清理、闲置随机点节流、上传 DataTexture。 */
  update(delta: number): void {
    // 点存活 fadeTime·4 秒；届时 exp(-4)≈0.018 视觉可忽略
    const expiry = this.params.fadeTime * 4
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i]
      if (!point) continue
      point.age += delta * (point.fastDecay ? 4 : 1)
      if (point.age > expiry) this.trail.splice(i, 1)
    }

    this.timeSinceLastMove += delta
    // 闲置 3 秒切回随机模式（sleep 模式永不切回，保持静止）
    if (this.idleMode === 'random' && this.timeSinceLastMove >= 3.0 && !this.isPlacingRandomPoints) {
      this.isPlacingRandomPoints = true
      this.randomPointTimer = 0
    }
    if (this.isPlacingRandomPoints) {
      this.randomPointTimer += delta
      if (this.randomPointTimer >= 1.5) {
        this.addRandomPoint()
        this.randomPointTimer = 0
      }
    }

    // 上传最新的 MAX_TRAIL 个活跃点到纹理
    const count = Math.min(this.trail.length, MAX_TRAIL)
    if (count > 0 || this.uniforms.uTrailCount.value > 0) {
      for (let i = 0; i < count; i++) {
        const p = this.trail[i]
        if (!p) continue
        const ti = i * 4
        this.trailData[ti] = p.x
        this.trailData[ti + 1] = p.z
        this.trailData[ti + 2] = p.age
        this.trailData[ti + 3] = p.distDelta
      }
      this.trailTexture.needsUpdate = true
      this.uniforms.uTrailCount.value = count
    }
  }

  dispose(): void {
    if (this.mouseEnabled) {
      this.engine.canvas.removeEventListener('pointermove', this.onPointerMove)
    }
    window.removeEventListener('resize', this.onResize)
    this.trailTexture.dispose()
    this.rayPlane.geometry.dispose()
    ;(this.rayPlane.material as THREE.Material).dispose()
  }

  private handlePointerMove(e: PointerEvent): void {
    this.mouseCoords.set(
      ((e.clientX - this.rect.left) / this.rect.width) * 2 - 1,
      -((e.clientY - this.rect.top) / this.rect.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(this.mouseCoords, this.engine.camera.instance)
    const hits = this.raycaster.intersectObject(this.rayPlane)
    const hit = hits[0]
    if (!hit) return

    const { x, z } = hit.point
    let distDelta = 0
    if (this.lastPoint) {
      const dx = x - this.lastPoint.x
      const dz = z - this.lastPoint.z
      distDelta = Math.sqrt(dx * dx + dz * dz)
      // 间距不足则不采样，避免密集点堆积产生过强波
      if (distDelta < this.params.trailSpacing) return
    }

    this.addPoint(x, z, distDelta)
    this.lastPoint = { x, z }

    // 鼠标活动：重置闲置计时，切回鼠标驱动模式
    this.timeSinceLastMove = 0
    this.isPlacingRandomPoints = false
    this.randomPointTimer = 0
  }
}
