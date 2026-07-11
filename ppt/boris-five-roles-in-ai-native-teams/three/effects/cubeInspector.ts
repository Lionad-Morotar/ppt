import * as THREE from 'three'
import type { WaveGridEngine } from '../core/waveGridEngine'

/**
 * 世界坐标 → 网格索引反推。纯函数，便于单测。
 *
 * 与 layoutGrid 的正向变换 `x = i*spacing - offset` 互逆：
 * `i = round((x + offset) / spacing)`，再 clamp 到 [0, gridSize-1]，
 * 避免 raycast 命中点落在网格边缘外时返回越界索引。
 */
export function worldToGrid(
  x: number,
  z: number,
  gridSize: number,
  spacing: number,
  offset: number,
): { i: number; j: number } {
  const toGrid = (v: number) => Math.round((v + offset) / spacing)
  const clamp = (v: number) => Math.max(0, Math.min(gridSize - 1, v))
  return { i: clamp(toGrid(x)), j: clamp(toGrid(z)) }
}

/**
 * 立方体调试探针：按住 cmd(Mac)/ctrl(Win) 时，raycast 鼠标位置落到背景网格，
 * 高亮命中方块（3D 线框）并在 console 输出三合一坐标（grid / world / screen），
 * 用于人工调整 icon 方块等装饰元素的位置。
 *
 * 设计取舍：
 * - 平时只有一个极轻量的 window mousemove 监听把 clientX/Y 存进变量，
 *   不做任何 raycast 与重绘——背景渲染开销不变。
 * - 按下修饰键才读最近一次鼠标坐标做一次 raycast + 高亮 + log。
 *   Mac 按住按键会持续 repeat keydown，借此实现"按住期间移动鼠标，高亮近似跟随"，
 *   无需额外绑 mousemove 高亮监听（守住"轻量存坐标"的承诺）。
 * - 高亮用独立的 LineSegments 线框，不碰背景 InstancedMesh 的波浪着色链，
 *   与现有 MouseTrail 一样复用同一套 raycast 姿态（NDC → 水平面命中点）。
 *
 * 框架无关，随 three/ 可移植；是否启用、何时启用由接入层（setup）控制。
 */
export class CubeInspector {
  private readonly engine: WaveGridEngine
  private readonly raycaster = new THREE.Raycaster()
  private readonly mouseNDC = new THREE.Vector2()

  /** 命中平面：与背景网格共面的 XZ 水平面（y=0），把 NDC 鼠标落到世界坐标。 */
  private readonly hoverPlane: THREE.Mesh
  /** 线框光标：略大于单个方块，红色描边醒目，不遮挡方块本身。 */
  private readonly cursor: THREE.LineSegments

  private readonly gridSize: number
  private readonly gridSpacing: number
  private readonly gridOffset: number

  private lastClientX = 0
  private lastClientY = 0
  private hasMouse = false
  /** 接入层按页型切换：仅首页 true。非首页时忽略修饰键、隐藏线框。 */
  private enabled = false

  constructor(engine: WaveGridEngine) {
    this.engine = engine
    const p = engine.stage.params
    this.gridSize = p.gridSize
    this.gridSpacing = p.cubeWidth + p.gap
    this.gridOffset = ((p.gridSize - 1) * this.gridSpacing) / 2

    // 与 MouseTrail.rayPlane 同构：bounds×bounds 水平面，可见性关闭仅用于 raycast
    const bounds = engine.stage.bounds
    this.hoverPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds, bounds),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
    )
    this.hoverPlane.rotation.x = -Math.PI / 2
    this.hoverPlane.updateMatrixWorld(true)
    engine.scene.add(this.hoverPlane)

    // 线框略大于方块（×1.15），高度对齐 cubeHeight，中心 y=0（不跟随波浪：
    // 调试工具标识"网格位置"，波浪中方块上下起伏时线框稳如锚点反而更易辨认）
    const cursorSize = p.cubeWidth * 1.15
    const box = new THREE.BoxGeometry(cursorSize, p.cubeHeight, cursorSize)
    const edges = new THREE.EdgesGeometry(box)
    // 0xd44545 近似 deck CSS 变量 --deck-red（oklch 55% 0.13 250），醒目且与主题协调
    const mat = new THREE.LineBasicMaterial({
      color: 0xd44545,
      transparent: true,
      opacity: 0.95,
    })
    this.cursor = new THREE.LineSegments(edges, mat)
    this.cursor.visible = false
    engine.scene.add(this.cursor)

    window.addEventListener('mousemove', this.onMouseMove)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  /** 接入层按页型切换：首页 enabled=true，其余页 false。 */
  setActive(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) this.cursor.visible = false
  }

  /** 屏幕鼠标 → NDC，相对 canvas（背景铺满视口，rect 即 viewport）。 */
  private updateNDC(): void {
    const rect = this.engine.canvas.getBoundingClientRect()
    this.mouseNDC.set(
      ((this.lastClientX - rect.left) / rect.width) * 2 - 1,
      -((this.lastClientY - rect.top) / rect.height) * 2 + 1,
    )
  }

  private readonly onMouseMove = (e: MouseEvent): void => {
    this.lastClientX = e.clientX
    this.lastClientY = e.clientY
    this.hasMouse = true
  }

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled) return
    // meta(Mac cmd) 或 ctrl(Win/Linux) 任一即触发，跨平台兼容
    if (!(e.metaKey || e.ctrlKey)) return
    if (!this.hasMouse) return
    // 含系统 repeat：按住期间持续以最新鼠标位更新高亮，近似跟随
    this.highlight()
  }

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'Meta' || e.key === 'Control') {
      this.cursor.visible = false
    }
  }

  /** raycast 命中方块 → 移动线框 + 输出三合一坐标。 */
  private highlight(): void {
    // EffectComposer 渲染路径下，camera.matrixWorld 在 render 帧外会停留在过期姿态，
    // raycast 前强制重算，确保 setFromCamera 用的机位与当前渲染画面一致
    this.engine.camera.instance.updateMatrixWorld(true)
    this.updateNDC()
    this.raycaster.setFromCamera(this.mouseNDC, this.engine.camera.instance)
    const hits = this.raycaster.intersectObject(this.hoverPlane)
    const hit = hits[0]
    if (!hit) return

    const { x, z } = hit.point
    const { i, j } = worldToGrid(
      x,
      z,
      this.gridSize,
      this.gridSpacing,
      this.gridOffset,
    )
    // 线框落到命中方块中心（与 layoutGrid 同一坐标换算）
    this.cursor.position.set(
      i * this.gridSpacing - this.gridOffset,
      0,
      j * this.gridSpacing - this.gridOffset,
    )
    this.cursor.visible = true

    // 三合一坐标：grid（人读，标清 i→x/j→z 方向语义）、world（喂 Three.js）、screen（判 h1 冲突）
    const sx = ((this.lastClientX / window.innerWidth) * 100).toFixed(0)
    const sy = ((this.lastClientY / window.innerHeight) * 100).toFixed(0)
    // eslint-disable-next-line no-console
    console.log(
      `[deck-cube] grid(i=${i}→x, j=${j}→z) world(${x.toFixed(2)}, ${z.toFixed(2)}) screen(${sx}%, ${sy}%)`,
    )
  }

  dispose(): void {
    window.removeEventListener('mousemove', this.onMouseMove)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.engine.scene.remove(this.hoverPlane, this.cursor)
    this.hoverPlane.geometry.dispose()
    ;(this.hoverPlane.material as THREE.Material).dispose()
    this.cursor.geometry.dispose()
    ;(this.cursor.material as THREE.Material).dispose()
  }
}
