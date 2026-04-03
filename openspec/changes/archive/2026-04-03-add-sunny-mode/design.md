## Context

当前主页是纯白背景、无交互氛围效果。参考项目 sunlit 使用纯 CSS + SVG filter 实现了逼真的阳光透窗效果（百叶窗 + 树叶光影 + 渐进模糊 + 光晕反射），零依赖、全 GPU 加速。

目标是将 sunlit 的核心视觉效果移植为 React 组件，作为主页的可切换覆盖层。

## Goals / Non-Goals

**Goals:**
- 在主页添加 toggle 按钮，点击开启/关闭阳光光影覆盖
- 效果包含：百叶窗阴影、树叶纹理风动、渐进模糊扩散、光晕反射
- 状态持久化到 localStorage
- 尊重 `prefers-reduced-motion`（关闭动画，仅显示静态光影）
- 零外部依赖，纯 CSS 动画 + SVG filter

**Non-Goals:**
- 不实现日夜切换（sunlit 的 dark mode 部分）
- 不做全站级别的 sunny mode，仅限主页
- 不做移动端手势交互

## Decisions

### 1. 组件架构：单文件覆盖层组件

`SunnyMode` 为独立客户端组件，渲染 fixed 定位的覆盖层叠在页面内容之上。通过 `pointer-events: none` 确保不阻挡页面交互。

**为什么不用 Context/Provider**：效果仅限主页，无需全局状态管理。localStorage + useState 足矣。

### 2. 视觉层次（从底到顶）

| 层 | 元素 | 技术 |
|----|------|------|
| L0 | 页面内容 | 不变 |
| L1 | 百叶窗阴影 | repeating-linear-gradient + matrix3d 透视变换 |
| L2 | 树叶纹理 | `leaves.png` + SVG feTurbulence/feDisplacementMap 风动 |
| L3 | 渐进模糊 | 4 层 backdrop-filter blur + mask-image 渐变 |
| L4 | 光晕反射 | linear-gradient 角落光 |

全部 `pointer-events: none`，全部使用 `will-change: transform` 或 `opacity` 提示 GPU 合成。

### 3. Toggle 按钮位置

放在主页 content 区域右上角（FloatingHeader 旁），使用 lucide-react 的 `Sun` 图标。激活时图标旋转 + 变色以示状态。

**为什么不放 sidebar**：sunny mode 是主页独有功能，不应污染全局导航。

### 4. 动画策略

- 百叶窗：CSS repeating-linear-gradient，无动画（静态阴影）
- 树叶：SVG filter animate（feTurbulence baseFrequency 16s 循环 + feDisplacementMap scale 20s 循环）+ CSS keyframes billow 8s 循环
- 渐进模糊：4 层 backdrop-filter，mask-image 渐变分区
- 光晕：静态 linear-gradient，opacity 0.3
- 入场/退场：opacity 0→1 过渡 0.8s

### 5. 素材

从 sunlit 项目复制 `leaves.png` 到 `public/assets/leaves.png`。

## Risks / Trade-offs

- **[性能]** backdrop-filter 在低端设备可能卡顿 → 通过 `prefers-reduced-motion` 降级为静态效果；模糊层数可按需减少
- **[Safari 兼容]** SVG filter animate 在部分 Safari 版本有 bug → 降级为纯 CSS transform 动画
- **[视觉遮挡]** 覆盖层可能影响文字可读性 → 控制百叶窗 opacity ≤ 0.07，模糊层不覆盖主内容区中心
