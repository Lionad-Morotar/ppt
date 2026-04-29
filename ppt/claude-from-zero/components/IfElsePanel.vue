<template>
  <div class="h-full border-2 border-[#a33124] bg-[#f8f1e6] p-5 flex flex-col">
    <div class="text-sm font-bold text-[#a33124] mb-3">
      传统方法：if / else 判别"是苹果"
    </div>
    <pre class="text-[11px] leading-5 text-[#16110f] whitespace-pre-wrap flex-1 overflow-hidden">
if (颜色 == "红色" || 颜色 == "青色") {
  if (形状 == "圆形" || 形状 == "略扁") {
    if (直径 > 5 &amp;&amp; 直径 &lt; 10) {
      if (表面 == "光滑" || 表面 == "略带斑点") {
        if (有果梗 || 有果蒂凹陷) {
          if (气味 == "甜香" || 气味 == "清香") {
            if (质地 == "脆" || 质地 == "略带粉") {
              return "是苹果";
            }
          }
        }
      }
    }
  }
}

// 光照不足的？有虫眼的？
// 切开的？杂交品种的？
// 放在篮子里的？
return "无法判断";</pre>
    <div class="mt-3 text-xs text-[#a33124] font-semibold">
      条件永远补不完，边缘情况永远存在
    </div>
  </div>
</template>
