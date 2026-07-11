// 波浪 GLSL 注入片段。在 Stage.onBeforeCompile 中替换标准 material 的
// `#include <common>` / `#include <begin_vertex>` / `#include <color_fragment>`。
// 抽成独立字符串常量便于单测断言（确认关键 uniform 与函数存在）。

import { MAX_TRAIL } from '../types'

/** 顶点 shader 顶部声明：varying、aOffset 属性、各 uniform、hash2 噪声函数。 */
export const waveVertexDeclarations = /* glsl */ `
varying float vHeight;
attribute vec2 aOffset;
uniform sampler2D uTrailTexture;
uniform int       uTrailCount;
uniform float     uWaveSpeed;
uniform float     uWaveFreq;
uniform float     uWaveWidth;
uniform float     uFadeTime;
uniform float     uAmplitude;
uniform float     uJitter;
uniform float     uMaxHeight;
uniform float     uIdleTime;
uniform float     uIdleAmp;
uniform float     uIdleFreq;

// 确定性逐实例哈希 → [-0.5, 0.5]，仅依赖世界位置，逐帧稳定
vec2 hash2( vec2 p ) {
  p = vec2( dot( p, vec2( 127.1, 311.7 ) ), dot( p, vec2( 269.5, 183.3 ) ) );
  return fract( sin( p ) * 43758.5453123 ) - 0.5;
}
`

/**
 * 顶点位移：只对上表面（position.y > 0）计算。遍历每个 trail 点叠加
 * 高斯包络 × 余弦振荡 × 时间衰减 × 距离衰减，加权平均后 clamp 抬升顶点。
 * 与 depth pass 共用，保证阴影与可见波形一致。
 */
export const waveVertexDisplacement = /* glsl */ `
vHeight = 0.0;
if ( position.y > 0.0 ) {
  vec2 jitter  = hash2( aOffset ) * uJitter;
  vec2 worldXZ = aOffset + jitter;
  float waveHeight  = 0.0;
  float totalWeight = 0.0;
  for ( int i = 0; i < ${MAX_TRAIL}; i++ ) {
    if ( i >= uTrailCount ) break;
    // texel 布局：(worldX, worldZ, age, distDelta)
    vec4 td = texture2D( uTrailTexture, vec2( ( float(i) + 0.5 ) / ${MAX_TRAIL}.0, 0.5 ) );
    float dist      = length( worldXZ - td.rg );
    float wavefront = uWaveSpeed * td.b;
    float relDist   = dist - wavefront;
    // 以扩散波前为中心的高斯包络
    float window = exp( -( relDist * relDist ) / ( uWaveWidth * uWaveWidth ) );
    // 指数时间衰减 + 距离衰减
    float fade   = exp( -td.b / uFadeTime );
    float atten  = 1.0 / ( 1.0 + dist * 0.1 );
    float weight = fade * window * atten * td.a;
    waveHeight  += weight * cos( uWaveFreq * relDist );
    totalWeight += weight;
  }
  // 加权平均：重叠波平均而非叠加，避免混沌
  waveHeight /= max( totalWeight, 1.0 );
  float displacement = clamp( waveHeight * uAmplitude, -uMaxHeight, uMaxHeight );
  transformed.y += displacement;
  vHeight = displacement;

  // per-instance 随机呼吸：每方块独立相位/频率的慢速 Y 抬升，画面上呈竖直方向轻缓缓动。
  // 为什么用 Y 而非 Z：立方体立在 Y 轴，Y 抬升不破坏网格阵列；相机 up=(0,0,-1) 滚转后
  // 世界 Y 在画面上呈竖直方向，俯视视觉最自然，且与上方波纹机制一致。depth pass 共用此位移。
  vec2 idleRand = hash2( aOffset );
  float phase = ( idleRand.x + 0.5 ) * 6.2831853;
  float freq  = uIdleFreq + idleRand.y * 0.18;
  transformed.y += sin( uIdleTime * freq + phase ) * uIdleAmp;
}
`

/** 片元 shader 顶部声明：vHeight varying + 颜色 uniform。 */
export const waveFragmentDeclarations = /* glsl */ `
varying float vHeight;
uniform vec3  uColorBase;
uniform vec3  uColorHigh;
uniform float uMaxHeight;
`

/** 片元着色：按顶点抬升量在基色↔高亮色间混合。
 * smoothstep 提升中小抬升的蓝色权重——波纹点稀疏，线性 mix 下蓝色会被白底+强光冲淡至不可见；
 * smoothstep(0,0.7) 让 t≈0.35 即可达 ~0.5 蓝混，蓝色波纹更易辨识（几何位移仍受 uMaxHeight 克制）。 */
export const waveFragmentColor = /* glsl */ `
float t = clamp( vHeight / uMaxHeight, 0.0, 1.0 );
float bt = smoothstep( 0.0, 0.5, t );
diffuseColor.rgb = mix( uColorBase, uColorHigh, bt );
// 波峰 additive 蓝：加性增蓝信号，对抗 tone mapping 对亮部的 desaturate，让 ripple 在 ACESFilmic 下仍泛蓝
diffuseColor.rgb += uColorHigh * bt * 0.7;
`
