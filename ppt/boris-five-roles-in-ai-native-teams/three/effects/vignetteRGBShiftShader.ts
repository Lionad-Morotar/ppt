/**
 * 后处理：暗角（vignette）+ RGB 色散（chromatic aberration）。
 * 离中心越远，暗角越深、RGB 通道偏移越大。1:1 复刻源 3d-wave-grid。
 *
 * 作为 `ShaderPass` 的着色器对象使用（见 Renderer 后处理链）。
 */
export const VignetteRGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    // 色散强度上限
    shiftAmount: { value: 0.005 },
    // 暗角起始半径（0~1）
    vignetteRadius: { value: 0.3 },
    // 暗角边缘软化宽度
    vignetteSoftness: { value: 0.3 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float shiftAmount;
    uniform float vignetteRadius;
    uniform float vignetteSoftness;
    varying vec2 vUv;

    void main() {
      // 1. 到屏幕中心的距离
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      // 象限符号：决定 RGB 偏移方向（中心对称向外）
      float horzQuadrant = sign(vUv.x - center.x);
      float vertQuadrant = sign(vUv.y - center.y);

      // 2. 暗角掩膜：中心 0，角点趋近 1
      float vignetteFactor = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, dist);

      // 3. 色散强度随暗角放大
      float currentShift = shiftAmount * vignetteFactor;

      // 4. 三通道分别采样：红向外偏、蓝向内偏、绿不动
      float r = texture2D(tDiffuse, vUv + vec2(currentShift * horzQuadrant, currentShift * vertQuadrant)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - vec2(currentShift * horzQuadrant, currentShift * vertQuadrant)).b;

      // 5. 角点变暗，匹配色散
      float darken = 1.0 - vignetteFactor * 0.5;

      gl_FragColor = vec4(vec3(r, g, b) * darken, 1.0);
    }
  `,
}
