## Why

博客侧边栏目前只有导航和个人信息，缺少氛围元素。在侧边栏底部嵌入一个仿真黑胶唱片播放器，配合网易云歌单数据（通过 MetingJS），让访客在浏览时可以听到博主精选的音乐，提升沉浸感和个人品牌表达。

## What Changes

- 新建黑胶唱片播放器 React 组件，纯 CSS 实现唱片旋转动画、纹路、标签区
- 集成 MetingJS（meting-js + APlayer）拉取网易云歌单数据作为音频源
- 将播放器嵌入主侧边栏（`MenuContent`）底部，桌面端可见
- 点击唱片切换播放/暂停状态，唱片旋转动画同步
- 显示当前歌曲名称和歌手信息在唱片标签区
- 隐藏 APlayer 原生 UI，仅用其 API 控制播放

## Capabilities

### New Capabilities
- `vinyl-player`: 仿真黑胶唱片播放器组件，包含 CSS 动画、播放控制、歌曲信息展示
- `meting-integration`: MetingJS 集成，从网易云歌单获取音频数据并驱动播放器

### Modified Capabilities

## Impact

- 新增组件: `src/components/vinyl-player/`
- 修改文件: `src/components/menu-content.js`（底部插入播放器）
- 新增依赖: `meting-js`、`aplayer`（或通过 CDN script 加载）
- 性能考量: 音频资源按需加载，不阻塞首屏渲染
- 移动端: 抽屉菜单中可选择性隐藏或缩小显示
