## Why

主页目前是纯白静态背景，缺少氛围感和互动性。参考 sunlit 项目的光影效果，在主页加入「阳光模式」toggle——用 CSS 百叶窗 + 树叶光影 + 渐进模糊模拟阳光透窗的效果，为访客带来沉浸式的自然光体验。这也是个人博客的差异化亮点。

## What Changes

- 新增 `SunnyMode` 客户端组件：百叶窗阴影 + 树叶纹理 + SVG feTurbulence 风动 + 渐进 backdrop-filter 模糊 + 光晕反射
- 新增 toggle 按钮（太阳图标），点击切换阳光覆盖层的显示/隐藏
- 状态持久化到 localStorage，刷新后保持用户偏好
- 新增 `leaves.png` 素材到 `public/assets/`
- 所有动画纯 CSS 实现，GPU 加速，尊重 `prefers-reduced-motion`

## Capabilities

### New Capabilities
- `sunny-mode`: 主页阳光光影覆盖效果——百叶窗、树叶风动、渐进模糊、光晕，以及 toggle 交互

### Modified Capabilities
（无）

## Impact

- 新增文件：`src/components/sunny-mode.js`、`public/assets/leaves.png`
- 修改文件：`src/app/page.js`（引入 toggle + SunnyMode 组件）
- 新增 CSS：`src/globals.css`（sunny-mode 相关动画和样式）
- 依赖：无新依赖，纯 CSS + vanilla JS
- 性能：所有动画使用 `transform`/`opacity`/`backdrop-filter`，GPU 合成层，不触发 layout
