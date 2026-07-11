---
theme: default
title: AI Native 团队，该凑齐哪五种人
mdc: true
fonts:
  sans: 'Avenir Next, PingFang SC, Microsoft YaHei, sans-serif'
  mono: 'JetBrains Mono, SFMono-Regular, monospace'
---

<!-- P1 封面（default layout + cmpt-hero，避免全局 FM 后首 slide frontmatter 触发空 slide） -->
<div class="cmpt-hero h-full flex flex-col justify-center mt-[-12vh]">
  <div class="cmpt-kicker">86 集商内部分享 · 杨韵澍</div>
  <h1 class="cmpt-hero__title">AI 原生团队，<br>该凑齐哪五种人</h1>
  <p class="cmpt-hero__statement">
    当前职位正在过期——Boris Cherny 眼中，团队只剩五种人。
  </p>
  <div class="cmpt-meta">
    <span>分工重排 → 原型配齐</span>
    <span>Boris Cherny · Claude Code</span>
  </div>
</div>


---
layout: default
---

<!-- P2 钩子·职位保质期 -->
<div class="cmpt-kicker">00 / 钩子</div>
<h2>当前职位，<br>还剩几年保质期？</h2>
<ul class="cmpt-bullet-list mt-8">
  <li><span class="cmpt-grad-text">美团 CLC Keemart</span>：前端后端正式合并，前端提前一个多月开始练后端</li>
  <li><span class="cmpt-grad-text">蚂蚁网商</span>：测试岗整体转向研发，半年缓冲后转全栈工程师</li>
  <li><span class="cmpt-grad-text">Shopify River</span>：每 8 个合并进主干的 PR，就有 1 个是这位 AI 同事合著</li>
</ul>
<p class="mt-8 cmpt-kicker">当对面工位坐的不是人、而是一个 Agent——这职位还剩多少保质期？</p>


---
layout: default
---

<!-- P3 旧地图·工业时代遗产 -->
<div class="cmpt-kicker">01 / 旧地图</div>
<h2>这套"专业分工"，<br>是工业时代的遗产</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>八年前我刚做前端时请教老员工，那套流程和今天<span class="cmpt-grad-text">几乎一模一样</span></li>
  <li>按职能切：需求从市场来 → 产品打磨 → 设计审核 → 前后端开发 → 数据/运营支撑</li>
  <li>这条流水线非常好用——但在 AI 面前，许多人质疑它行不通了</li>
</ul>


---
layout: default
---

<!-- P4 观点源头·Boris Cherny -->
<div class="cmpt-kicker">观点源头</div>
<h2>Boris Cherny——<br>Claude Code 缔造者</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>Anthropic 内部孵化式小团队，不长的时间里造出 <span class="cmpt-grad-text">Claude Code / CC Desktop / MCP</span></li>
  <li><span class="cmpt-grad-text">loop engineering</span> 提出者：以 loop 为 harness 核心，跑更多、更廉价的智能体</li>
  <li>核心假设：流程型工作通过<span class="cmpt-grad-text">左移</span>把人解放，更多工作交给 Agent 自动化</li>
</ul>
<p class="mt-6 cmpt-kicker">从这个视角，他观察到团队里浮现的——是能力原型。</p>


---
layout: default
---

<!-- P5 新地图·五种人 -->
<div class="cmpt-kicker">02 / 新地图</div>
<h2>五种人，<br>不是五种职位</h2>
<div class="grid grid-cols-5 gap-4 mt-10 text-center">
  <div><div class="text-5xl">💡</div><div class="cmpt-grad-text mt-2">Prototyper</div><div class="text-sm text-opacity-70">我有一个想法</div></div>
  <div><div class="text-5xl">🔨</div><div class="cmpt-grad-text mt-2">Builder</div><div class="text-sm">把它造出来</div></div>
  <div><div class="text-5xl">🧹</div><div class="cmpt-grad-text mt-2">Sweeper</div><div class="text-sm">把它变好</div></div>
  <div><div class="text-5xl">📈</div><div class="cmpt-grad-text mt-2">Grower</div><div class="text-sm">让它长大</div></div>
  <div><div class="text-5xl">🛡️</div><div class="cmpt-grad-text mt-2">Maintainer</div><div class="text-sm">稳稳地跑</div></div>
</div>
<p class="mt-10">原型 ≠ 职位。它描述的是<span class="cmpt-grad-text">你创造价值的方式</span>，不是名片上的字。</p>


---
layout: default
---

<!-- P6 原型① Prototyper -->
<div class="cmpt-kicker">原型 ①</div>
<h2>Prototyper · "我有一个想法"</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>大量产出全新想法，多数不会落地——<span class="cmpt-grad-text">这不重要</span></li>
  <li>Boris 争议观点：<span class="cmpt-grad-text">编码已经是被解决的问题</span></li>
  <li>用 AI 把一个模糊念头，在数小时 / 一天内变成可摸、可点、能上手玩的东西</li>
</ul>
<p class="mt-6 cmpt-kicker">一周做 7 个原型，扔掉 6 个，剩 1 个交给 Builder。</p>


---
layout: default
---

<!-- P7 原型② Builder -->
<div class="cmpt-kicker">原型 ②</div>
<h2>Builder · "把它造出来"</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>接过原型，在生产环境真正落地、<span class="cmpt-grad-text">拿到数据反馈</span>，才算进入循环</li>
  <li>不是程序员专属：设计师用 AI 生成一整套设计语言、进了生产环境，她那一刻就是 Builder</li>
  <li>关键是"让东西跑起来"的<span class="cmpt-grad-text">工程直觉</span></li>
</ul>


---
layout: default
---

<!-- P8 原型③ Sweeper -->
<div class="cmpt-kicker">原型 ③</div>
<h2>Sweeper · "把它变好"</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>Boris 今年：<span class="cmpt-grad-text">40 万行新增 + 25 万行删减</span>——功能在变，废墟也得清</li>
  <li>持续清理、简化、下线没用过的系统，让产品和平台变干净</li>
  <li>需要很强的<span class="cmpt-grad-text">产品感和工程品味</span></li>
</ul>
<p class="mt-6 cmpt-kicker">成果是"东西变少了"——所以他们最容易被低估。</p>


---
layout: default
---

<!-- P9 原型④ Grower -->
<div class="cmpt-kicker">原型 ④</div>
<h2>Grower · "让它长大"</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>接手已建好的产品，不断迭代，把 <span class="cmpt-grad-text">PMF</span>（产品-市场匹配）拉高</li>
  <li>做新需求 / 新实验 / 投广告 / 看数据 / 调转化 / 跑 A-B 测</li>
  <li>把产品放进<span class="cmpt-grad-text">"假设 → 验证 → 调整"</span>的数据循环，越跑越快</li>
</ul>


---
layout: default
---

<!-- P10 原型⑤ Maintainer -->
<div class="cmpt-kicker">原型 ⑤</div>
<h2>Maintainer · "让它稳稳地跑"</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>专家群体，扎实的理论 + 实操经验，守成熟系统安全、可靠、高效地扩展</li>
  <li>AI 能帮他更快定位问题</li>
  <li>但<span class="cmpt-grad-text">系统边界、数据风险、架构取舍、业务正确性</span>，仍需资深兜底</li>
</ul>
<p class="mt-6 cmpt-kicker">"什么不能动"的直觉，AI 现在还没有。</p>


---
layout: default
---

<!-- P11 阵型·三阶段 -->
<div class="cmpt-kicker">03 / 阵型</div>
<h2>不同阶段，不同阵容——<br>这是战术板，不是人格测试</h2>
<div class="grid grid-cols-3 gap-6 mt-10">
  <div class="p-4" style="border:2px solid var(--deck-line)">
    <h3>Pre-PMF</h3>
    <p class="cmpt-grad-text mt-2">原型者 + 建造者 + 清扫者</p>
    <p class="text-sm mt-2">大量试错、快速建造、及时清理废墟</p>
  </div>
  <div class="p-4" style="border:2px solid var(--deck-line)">
    <h3>PMF 增长期</h3>
    <p class="cmpt-grad-text mt-2">建造者 + 清扫者 + 增长者<br><span class="text-sm">+ 一些守护者</span></p>
    <p class="text-sm mt-2">建造 / 清理 / 增长并重，系统开始要稳</p>
  </div>
  <div class="p-4" style="border:2px solid var(--deck-line)">
    <h3>强 PMF 规模化</h3>
    <p class="cmpt-grad-text mt-2">清扫者 + 增长者 + 守护者<br><span class="text-sm">+ 一些建造者</span></p>
    <p class="text-sm mt-2">守住质量、支撑规模，只留少量建造</p>
  </div>
</div>
<p class="mt-8">规律：<span class="cmpt-grad-text">Sweeper 从第一天就需要，Maintainer 是成熟路上才加入</span>。</p>


---
layout: default
---

<!-- P12 辨析·为什么不是全栈 -->
<div class="cmpt-kicker">04 / 辨析</div>
<h2>这跟"全栈工程师"<br>有什么区别？</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>切入点完全不同：原型是<span class="cmpt-grad-text">产品视角</span>的能力模型</li>
  <li>编码已被解决 → 但大量时间耗在迭代0、创意碰撞等编码上下游阶段</li>
  <li>全栈是<span class="cmpt-grad-text">技术栈导向</span>：会页面 + API + 数据库 + 部署，关注端到端交付</li>
</ul>
<p class="mt-6 cmpt-kicker">不是新瓶装旧酒——是换了一把尺子去量人。</p>


---
layout: default
---

<!-- P13 回到开头·分工重排 -->
<div class="cmpt-kicker">05 / 回到开头</div>
<h2>所以，当下职位还剩多少保质期？</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>这其实<span class="cmpt-grad-text">不是个合理的问题</span>——AI native 团队面临的，是分工形态的重排</li>
  <li>从"按职能切"变成<span class="cmpt-grad-text">"按原型配"</span></li>
  <li>原型不绑职能：PM 动手改代码，成了，那他就是 Prototyper 甚至 Builder</li>
</ul>
<p class="mt-6 cmpt-kicker">"Web 前端"作为标签的描述能力，正在被瓦解。</p>


---
layout: default
---

<!-- P14 落到个人·你是哪种角色 -->
<div class="cmpt-kicker">06 / 落到个人</div>
<h2>你是哪种角色？</h2>
<ul class="cmpt-bullet-list mt-8">
  <li>健康的团队不是人人全能，是按产品阶段把原型配齐——<span class="cmpt-grad-text">一支好球队，不是十一个梅西</span></li>
  <li>观察自己和同事做事时的姿态：那个脑袋闪闪发光的瞬间，就是你的优势原型</li>
</ul>
<p class="mt-6 cmpt-kicker">不再问"我会不会被 AI 替代"——而是"我是哪种角色，想成为哪一种"。</p>


---
layout: center
---

<!-- P15 收口 + QA -->
<div class="text-center">
  <div class="cmpt-kicker">End</div>
  <h1 class="cmpt-hero__title">你创造价值的方式，<br>是什么？</h1>
  <p class="cmpt-hero__statement" style="margin:1.6rem auto 0">
    问题不再是"我会不会被 AI 替代"<br>
    而是——<span class="cmpt-grad-text">我是哪种角色？我愿意练哪一种？</span>
  </p>
  <p class="cmpt-meta cmpt-meta--author" style="justify-content:center">
    <span>QA</span>
  </p>
</div>

