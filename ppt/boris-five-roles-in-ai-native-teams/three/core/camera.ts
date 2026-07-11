import * as THREE from 'three'
import type { WaveGridEngine } from './waveGridEngine'

/**
 * 透视相机。鼠标位置驱动小幅轨道倾斜：鼠标 Y → 绕 X 轴俯仰（α），
 * 鼠标 X → 绕 Z 轴偏航（β），lerp 平滑跟随，营造空间感而非自由轨道。
 */
export class Camera {
  instance: THREE.PerspectiveCamera

  private radius = 12
  private readonly alphaRange = Math.PI * 0.03 // ±~5° 俯仰
  private readonly betaRange = Math.PI * 0.05 // ±~9° 偏航
  private readonly mouse = new THREE.Vector2(0, 0)
  private readonly lerpedMouse = new THREE.Vector2(0, 0)
  /** PPT 背景模式：禁用鼠标轨道，固定斜俯视机位（缓动由 per-instance shader 接管） */
  private readonly isPPT: boolean

  constructor(private readonly engine: WaveGridEngine) {
    const { sizes, scene } = engine
    this.instance = new THREE.PerspectiveCamera(
      40,
      sizes.width / sizes.height,
      0.1,
      200,
    )
    this.isPPT = engine.trailOptions?.mouseEnabled === false
    this.updatePosition(0, 0)
    scene.add(this.instance)
    // PPT 背景模式无需鼠标轨道（mouseEnabled=false 时鼠标不影响相机）
    if (!this.isPPT) {
      window.addEventListener('mousemove', this.onMouseMove)
    }
  }

  private readonly onMouseMove = (e: MouseEvent): void => {
    const { sizes } = this.engine
    this.mouse.x = (e.clientX / sizes.width) * 2 - 1
    this.mouse.y = -(e.clientY / sizes.height) * 2 + 1
  }

  resize(): void {
    const { sizes } = this.engine
    this.instance.aspect = sizes.width / sizes.height
    this.instance.updateProjectionMatrix()
  }

  update(_delta: number): void {
    if (this.isPPT) {
      // PPT 背景：固定机位，per-instance 呼吸已在 vertex shader 接管缓动
      this.updatePosition(0, 0)
    } else {
      // lerp 系数 0.04：缓慢追随，避免相机抖动
      this.lerpedMouse.x += (this.mouse.x - this.lerpedMouse.x) * 0.04
      this.lerpedMouse.y += (this.mouse.y - this.lerpedMouse.y) * 0.04
      this.updatePosition(this.lerpedMouse.x, this.lerpedMouse.y)
    }
    // updatePosition 经 lookAt 改 quaternion 后，强制把 local matrix 同步到 matrixWorld。
    // EffectComposer 渲染路径下 scene.updateMatrixWorld 对 camera 的更新不可靠：
    // r185 的 matrixWorldNeedsUpdate 机制在 force=false 时会跳过重算，
    // 必须 force=true，否则 raycast 与投影读到停留在过期姿态（identity）的 matrixWorld。
    this.instance.updateMatrixWorld(true)
  }

  private updatePosition(mx: number, my: number): void {
    if (this.isPPT) {
      // 斜俯视固定机位：per-instance 呼吸已在 shader 接管，相机不再整机摆动
      // （整机摆动会让所有方块整齐划一，违背"每方块各自随机"诉求）
      this.instance.position.set(0, 11, 6)
      this.instance.up.set(0, 0, -1)
      this.instance.lookAt(0, 0, 0)
      return
    }
    const alpha = my * this.alphaRange
    const beta = mx * this.betaRange
    // 起点 (0, r, 0)，先绕 X 再绕 Z 旋转
    this.instance.position.set(
      -this.radius * Math.cos(alpha) * Math.sin(beta),
      this.radius * Math.cos(alpha) * Math.cos(beta),
      this.radius * Math.sin(alpha),
    )
    this.instance.up.set(0, 0, -1)
    this.instance.lookAt(0, 0, 0)
  }

  dispose(): void {
    if (!this.isPPT) {
      window.removeEventListener('mousemove', this.onMouseMove)
    }
  }
}
