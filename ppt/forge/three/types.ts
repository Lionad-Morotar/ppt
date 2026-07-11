/**
 * 引擎共享类型。框架无关，迁移时随 `three/` 一起带走。
 */

/**
 * trail 容量 = vertex shader 的纹理宽度与循环上界，三处必须一致。
 * 单一来源：shader 经模板插值引用此常量，避免魔数双源（外部审查 P2）。
 */
export const MAX_TRAIL = 128

/** 一个鼠标轨迹点：世界坐标 XZ、年龄（秒）、与上一点的间距。 */
export interface TrailPoint {
  x: number
  z: number
  age: number
  distDelta: number
  /** 快速衰减：age 以 4 倍速率增长，等效 fadeTime/4，用于翻页 ripple 迅速消失 */
  fastDecay?: boolean
}

/** 波浪与网格的可调参数。S1 仅用网格部分；S2/S3 启用波浪项。 */
export interface WaveParams {
  /** 立方体间距 */
  gap: number
  cubeWidth: number
  cubeHeight: number
  /** 每边立方体数（总数为 gridSize²） */
  gridSize: number
  /** 波浪幅度 */
  waveAmplitude: number
  /** 波前扩散速度（世界单位/秒） */
  waveSpeed: number
  /** 空间振荡频率（弧度/世界单位） */
  waveFrequency: number
  /** 高斯包络半宽（世界单位） */
  waveWidth: number
  /** 每实例位置抖动，打破网格规整感 */
  waveJitter: number
  /** 单顶点抬升上限，防止极端值 */
  waveMaxHeight: number
  /** per-instance 随机呼吸幅度（Y 抬升，俯视下呈画面竖直缓动）；0=关闭 */
  idleAmp: number
  /** per-instance 呼吸基础频率（Hz），每方块在此之上叠加 hash 随机偏移 */
  idleFreq: number
  /** 基色（谷底） */
  colorBase: string
  /** 高亮色（波峰） */
  colorHigh: string
}

/** 默认参数，与源仓库 3d-wave-grid 对齐。 */
export const DEFAULT_WAVE_PARAMS: WaveParams = {
  gap: 0.01,
  cubeWidth: 0.8,
  cubeHeight: 3,
  gridSize: 30,
  waveAmplitude: 0.4,
  waveSpeed: 6.0,
  waveFrequency: 1.2,
  waveWidth: 3.0,
  waveJitter: 0.2,
  waveMaxHeight: 0.4,
  idleAmp: 0.08,
  idleFreq: 0.32,
  colorBase: '#f7faff',
  colorHigh: '#6fb6ff',
}

/**
 * 引擎行为选项——forge PPT 背景专用配置入口。
 * 原 demo 以鼠标涟漪 + 闲置随机波为卖点；PPT 背景需要静止可控，故抽出开关。
 */
export interface TrailOptions {
  /** 是否响应鼠标 pointermove 涟漪；PPT 背景设 false（静止无鼠标交互）。 */
  mouseEnabled?: boolean
  /** 闲置模式：'random'=中心随机波（默认）；'sleep'=完全静止，仅外部 addPoint 驱动。 */
  idleMode?: 'random' | 'sleep'
}
