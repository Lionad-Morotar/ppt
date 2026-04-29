---
name: Slidev DOM 常驻结构
description: Slidev 在运行时会将所有 slide 页面常驻 DOM（通过 display: none/block 切换可见性），跨 slide 查询组件时必须限定在当前可见 slide 内
type: feedback
---

**规则**：在 Slidev 项目中使用 `document.querySelectorAll('.component-class')` 时，必须进一步过滤出当前可见 slide 内的元素，避免操作到其他 slide 的同名组件实例。

**Why**: 在调试 CmptPanel 组件时，使用 `document.querySelectorAll('.cmpt-panel-wrapper')` 返回了 38 个元素（跨所有 slide），导致测试时频繁操作到不可见 slide 上的面板，产生状态不一致的困惑（同一索引位置的元素前后查询结果不同）。实际上 Slidev 将所有 `.slidev-page` 节点常驻 DOM，仅通过 `style="display: none"` 控制显隐。

**How to apply**:
- 查询当前 slide 内的组件时，先定位可见 slide：`const currentSlide = document.querySelector('.slidev-page:not([style*="display: none"])')`
- 然后在此范围内查询：`currentSlide.querySelectorAll('.target-component')`
- 或者在查询后通过 `getBoundingClientRect()` 过滤 viewport 内可见的元素
- 此模式适用于所有 Slidev 相关的 DOM 操作（测试、数据提取、自动化等）
