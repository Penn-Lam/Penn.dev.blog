## 1. 素材准备

- [x] 1.1 从 sunlit 项目复制 `leaves.png` 到 `public/assets/leaves.png`

## 2. 核心组件

- [x] 2.1 创建 `src/components/sunny-mode.js`：百叶窗层（repeating-linear-gradient + matrix3d）、树叶层（leaves.png + SVG feTurbulence/feDisplacementMap 风动 + billow 动画）、渐进模糊层（4 层 backdrop-filter blur + mask-image）、光晕层（linear-gradient）
- [x] 2.2 实现 toggle 逻辑：useState + localStorage 持久化，0.8s 淡入/淡出过渡
- [x] 2.3 添加 `prefers-reduced-motion` 降级：禁用动画，保留静态光影

## 3. 全局样式

- [x] 3.1 在 `src/globals.css` 添加 sunny-mode 相关 CSS keyframes（billow）和动画类

## 4. 页面集成

- [x] 4.1 在 `src/app/page.js` 引入 SunnyMode 组件和 toggle 按钮（Sun 图标，激活时旋转变色）

## 5. 验证

- [x] 5.1 运行 lint + typecheck，确保无错误
- [x] 5.2 本地 `bun build` 验证构建成功
