import type { MermaidConfig } from 'mermaid'

/**
 * Mermaid 主题配置 - 匹配暖色调 PPT 主题
 *
 * 主题色参考：
 * --deck-bg: #efe6d6
 * --deck-paper: #f8f1e6
 * --deck-ink: #16110f
 * --deck-ink-soft: #4d433d
 * --deck-red: #a33124
 * --deck-red-dark: #6e1f16
 * --deck-line: #16110f
 */
export default async function setupMermaid(): Promise<MermaidConfig> {
  return {
    theme: 'base',
    themeVariables: {
      /* 节点 */
      primaryColor: '#f8f1e6',
      primaryTextColor: '#16110f',
      primaryBorderColor: '#16110f',

      /* 连线与箭头 */
      lineColor: '#16110f',

      /* 次要/第三颜色（用于交替节点） */
      secondaryColor: '#e4d7c3',
      tertiaryColor: '#f2e8da',

      /* 字体 */
      fontFamily: 'Avenir Next, PingFang SC, Microsoft YaHei, sans-serif',

      /* 边标签 */
      edgeLabelBackground: '#f8f1e6',

      /* 特殊节点（判断/菱形） */
      cScale0: '#f8f1e6',
      cScale1: '#e4d7c3',
      cScale2: '#f2e8da',
    },
    /* 通过 themeCSS 注入额外样式：限制 SVG 最大宽度 */
    themeCSS: `
      svg {
        max-width: 100% !important;
        height: auto !important;
      }
      .node rect, .node circle, .node ellipse, .node polygon, .node path {
        fill: #f8f1e6 !important;
        stroke-width: 2px !important;
      }
      .edgePath .path {
        stroke-width: 2px !important;
      }
    `,
  }
}
