# CSS POAA（20 min）

## 从改变样式到绘画（3 min）

我想知道在座的大哥们，谁**没有**写过 CSS 的，请先举一下手~

| 如果大家熟悉，那一般来说...
| 如果不熟悉，那先简单介绍一下

我们随便打开一个[页面](https://www.baidu.com/s?wd=水箱)，页面上展示的东西呢其实是由一个个的方形小盒子组成的，CSS 起到的作用就是去控制这些盒子的形状大小颜色，或他们怎么样在页面上排列。（以页面举例）

```js
$$('*').map(x => (x.style.border = '1px solid'))
```

---

如果我再问一个问题，CSS 还能用来做什么？

嗯，不仅仅是形状大小颜色，CSS 还可以用来排版、做交互、写动画。一些高阶玩家甚至可以用 CSS 写游戏、或者是艺术绘画。

- [蓝图](https://codepen.io/oliviale/pen/moLrBq)
- [手风琴](https://codepen.io/danwilson/pen/BRdJVZ)
- [CSS Shake](https://elrumordelaluz.github.io/csshake/)
- [CSS Loading](https://connoratherton.com/loaders)
- [CSS Doodle](https://css-doodle.com/)
- [CSS MC](https://codepen.io/hailedev/pen/OJyvvVQ)
- [SVG Pattern](https://codepen.io/cobra_winfrey/pen/zYvdKPG)
- [CSS Achitecture](https://codepen.io/ricardoolivaalonso/pen/yLOpNdZ)
- [CSS Landscape](https://codepen.io/ivorjetski/full/xxGYWQG)

---

## 什么是锯齿（5 min）

总之我们能感觉到，CSS 在图形方面还是有点点天赋可以施展的，有非常多的 API 可以用来画画。

不过，我们看画面。有时画面会出现一些诡异的情况，我稍稍放大一下...

---

能发现，画面上其实有一些犬牙交错的线条。这个很像电锯的牙齿，所以人们会把这玩意儿叫做锯齿。

---

那人们为了消除用 CSS 画画时产生锯齿，使用了什么方案呢？

---

当然就是**不**使用 CSS 画画咯~

---

不过今天我要分享的是一种 CSS 抗锯齿的方法，所以我们最好回到正题，康康对计算机来说，画一条直线意味着什么。

- [Bresenham Algorithm Line Demo](http://bert.stuy.edu/pbrooks/graphics/demos/BresenhamDemo.htm)

消除锯齿，我们想要达的效果其实是这种：

---

- [Demo 2D](https://marc-roig.github.io/Bresenham_Visualization/Bresenham2D/)

---

你的屏幕通常是一个一个的正方形小点组成的，我们常说的分辨率就是指这些点在显示器宽和高上的乘积，比如 1920 \* 1080 就代表你的屏幕上有两百万这样的小点。

除非你没戴眼镜，或者脑袋距离屏幕特别远，你无法分辨两百万个点中的一个。不然，你的眼睛就会注意到这些锯齿，并且对他们耿耿于怀。

## POAA（5 min）

好，有跑题了，这里介绍一下 POAA，很洋气的名字，我取的，pixel-offset-anti-anliasing，中文叫：像素偏移抗锯齿。

---

回到锯齿，因为人眼对对比度是非常敏感的，但是锯齿断裂的方向和线条方向不一致，我们需要找到锯齿，并在他们之间，填充内容物，使断裂方向和线段方向一致就行了。

这里我们填充的是三角形，我们知道全世界没有一款屏幕的像素点是三角形形状的，所以我用的是一种替代办法，使用透明度替代填充的内容。

---

我们看看透明度是如何带来抗锯齿效果的，以一张实际的图片举例... 我们在可能出现狗牙的这些地方放一些不同透明度的像素，使他们混入其中，这样我们的眼睛就不能分辨出两种颜色强烈的对比了。所以看起来会像是一条直线。

---

我们看看对一副特定的图案，POAA 做了哪些工作。

比如这里，我们有红蓝黄相间的条纹，在斜线的地方，锯齿还是特别明显的。POAA 的步骤大致分为三步：

1. 找到锯齿（也就是找到斜线）
2. 画一条透明度按规律变化的线
3. 调整线的偏移距离，使线覆盖到锯齿上面

最终效果

就这么简单，虽然听起来有点像在回答“怎样把大象塞进冰箱”那个问题，正好也是三步：

1. 打开冰箱门
2. 把大象塞进去
3. 把冰箱门关上

其实 POAA 在完整这些步骤的时候处理了一些细节，比方说如果我用 CSS Background 的 Radial Gradient 渐变绘制了一些同心圆，那么怎么才能确认圆的边缘所在位置呢？

因为大家可能对使用 CSS 画画不是特别的熟悉，所以这里不继续介绍具体的代码了，有兴趣的话欢迎**线下**交流~~

## 最后

最后提一嘴使用场景，额，just for fun，几乎零使用场景。还记得人们是怎么解决使用 CSS 画画会出现锯齿的问题的吗？

HTML 中有 Canvas、SVG 这些看起来比较新的技术，用起来效率更高，性能也更高，会逐渐取缔 CSS 绘画。大家可以去尝试一下。
