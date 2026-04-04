## ADDED Requirements

### Requirement: MetingJS 脚本加载
系统 SHALL 通过 `next/script` 异步加载 APlayer CSS 和 MetingJS JavaScript。

#### Scenario: 首次页面加载
- **WHEN** 页面首次渲染
- **THEN** APlayer CSS（CDN）和 MetingJS JS（CDN）以 `afterInteractive` 策略加载，不阻塞首屏

### Requirement: 网易云歌单数据获取
系统 SHALL 通过 `<meting-js>` Web Component 获取指定网易云歌单的曲目列表。

#### Scenario: 歌单加载成功
- **WHEN** MetingJS 脚本加载完成
- **THEN** 渲染隐藏的 `<meting-js server="netease" type="playlist" id="{PLAYLIST_ID}">` 元素，解析出歌曲列表

#### Scenario: 歌单 ID 通过环境变量配置
- **WHEN** 环境变量 `NEXT_PUBLIC_NETEASE_PLAYLIST_ID` 已设置
- **THEN** 使用该值作为歌单 ID

### Requirement: APlayer 实例控制
系统 SHALL 通过 `<meting-js>` 内部的 APlayer 实例 API 控制音频播放。

#### Scenario: 获取 APlayer 实例
- **WHEN** `<meting-js>` 元素解析完成
- **THEN** 通过 `metingElement.aplayer` 获取 APlayer 实例，暴露 `play()`、`pause()`、`skipForward()`、`skipBack()`、`list` 等 API

#### Scenario: 监听播放事件
- **WHEN** APlayer 实例就绪
- **THEN** 监听 `play`、`pause`、`listswitch` 事件，同步更新 React 状态（isPlaying、currentTrack）

### Requirement: 隐藏原生 APlayer UI
系统 SHALL 隐藏 MetingJS 自动创建的 APlayer 播放器 UI，仅使用其 API。

#### Scenario: APlayer UI 不可见
- **WHEN** `<meting-js>` 渲染完成
- **THEN** 其生成的 `.aplayer` DOM 元素通过 CSS `display: none` 或 `position: absolute; opacity: 0; pointer-events: none` 隐藏
