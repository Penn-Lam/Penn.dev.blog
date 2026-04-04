## Context

博客侧边栏（`MenuContent`）当前包含头像/导航/社交链接三部分。用户希望在底部加入黑胶唱片风格的音乐播放器，通过 MetingJS 从网易云歌单拉取曲目数据。参考的原始实现基于 jQuery + SoundCloud，需要重构为 React 组件 + 网易云音乐源。

侧边栏宽度约 `w-60`(240px) ~ `w-72`(288px)，播放器需要适配此尺寸。

## Goals / Non-Goals

**Goals:**
- 在侧边栏底部渲染可交互的黑胶唱片播放器
- 点击唱片播放/暂停，唱片旋转动画同步
- 通过 MetingJS 拉取网易云歌单，自动播放列表中的歌曲
- 显示当前歌曲名/歌手
- 支持上一首/下一首切换

**Non-Goals:**
- 不实现完整音乐播放器 UI（进度条、音量控制等）
- 不在移动端抽屉菜单中显示（空间不足）
- 不自建音频后端，完全依赖 MetingJS CDN 服务

## Decisions

### 1. MetingJS 集成方式：Script 标签 + 自定义 Hook

**选择**: 通过 `next/script` 加载 APlayer CSS 和 MetingJS JS，然后用自定义 hook 监听 `meting-js` 元素解析出的音频列表。

**原因**: MetingJS 是 Web Component（`<meting-js>`），内部自动创建 APlayer 实例。在 React 中最干净的方式是：
1. 渲染一个隐藏的 `<meting-js>` 元素获取歌单数据
2. 通过 ref 访问其内部 APlayer 实例的 API
3. 用 APlayer 实例控制播放，而不自己再造播放逻辑

**替代方案**: 直接调用网易云 API → 需要处理反盗链、CORS，不如 MetingJS 的 CDN 代理稳定。

### 2. 播放器组件架构

```
src/components/vinyl-player/
  index.js        — 主组件，组合唱片 UI + 音频控制
  vinyl-record.js — 纯展示组件：唱片、标签、旋转动画
  use-meting.js   — Hook：加载 MetingJS，获取 APlayer 实例，暴露播放控制
```

### 3. 唱片 CSS 动画

**选择**: 保留原始 CSS 的 `repeating-radial-gradient` 纹路 + `spin-on/spin-off` 旋转动画，用 Tailwind + CSS Module 混合实现。

**原因**: 纹路效果依赖复杂渐变，用纯 Tailwind 难以表达，CSS Module 更合适。旋转动画简单，可用 Tailwind `animate-spin` 的自定义变体。

### 4. 歌单配置

**选择**: 网易云歌单 ID 通过环境变量 `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` 配置，默认值写在组件中。

**原因**: 方便后续更换歌单，不需要改代码。

## Risks / Trade-offs

- **MetingJS CDN 可用性** → 播放器优雅降级：加载失败时显示静态唱片，不旋转
- **网易云歌曲版权限制** → 部分歌曲可能无法播放，MetingJS 会自动跳过
- **侧边栏空间紧张** → 唱片直径控制在 120-140px，底部固定定位不影响导航滚动
- **音频自动播放被浏览器阻止** → 必须用户点击唱片才开始播放，符合浏览器策略
