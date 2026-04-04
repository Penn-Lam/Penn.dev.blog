## 1. 基础设施

- [x] 1.1 在 `src/app/layout.js` 中通过 `next/script` 加载 APlayer CSS 和 MetingJS JS（afterInteractive）
- [x] 1.2 添加环境变量 `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` 到 `.env` 和 `.env.example`

## 2. MetingJS 集成 Hook

- [x] 2.1 创建 `src/components/vinyl-player/use-meting.js`：渲染隐藏 `<meting-js>` 元素，监听 APlayer 实例就绪，暴露 `{ isReady, isPlaying, currentTrack, play, pause, next, prev }` 状态和方法
- [x] 2.2 添加 CSS 隐藏 APlayer 原生 UI（`.aplayer { display: none }` 或等效方式）

## 3. 唱片组件

- [x] 3.1 创建 `src/components/vinyl-player/vinyl-record.module.css`：唱片纹路（repeating-radial-gradient）、标签区、旋转动画（spin-on/spin-off）、主轴样式
- [x] 3.2 创建 `src/components/vinyl-player/vinyl-record.js`：纯展示组件，接收 `isPlaying`、`trackName`、`artistName`、`onClick` props，渲染唱片 DOM 结构
- [x] 3.3 创建 `src/components/vinyl-player/index.js`：主组件，组合 `useMeting` hook + `VinylRecord` 组件，处理播放/暂停切换逻辑

## 4. 侧边栏集成

- [x] 4.1 修改 `src/components/menu-content.js`：在底部导入并渲染 `VinylPlayer` 组件，仅桌面端（lg+）可见
- [x] 4.2 更新 L2/L3 文档头部（GEB 协议）

## 5. 验证

- [x] 5.1 本地 `bun dev` 验证：唱片渲染、点击播放/暂停、歌曲信息显示、旋转动画
- [x] 5.2 验证优雅降级：断网或 CDN 不可达时显示静态唱片
