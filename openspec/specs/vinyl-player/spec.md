## ADDED Requirements

### Requirement: 唱片播放器渲染
系统 SHALL 在侧边栏（`MenuContent`）底部渲染一个仿真黑胶唱片播放器组件，包含唱片盘面、纹路、中心标签区和主轴。

#### Scenario: 侧边栏加载时显示静态唱片
- **WHEN** 页面加载完成，侧边栏渲染
- **THEN** 底部显示静态黑胶唱片，唱片不旋转，标签区显示默认文字或首首歌曲信息

#### Scenario: 仅桌面端显示
- **WHEN** 屏幕宽度 < lg 断点（移动端抽屉菜单）
- **THEN** 唱片播放器不渲染

### Requirement: 点击播放/暂停
用户 SHALL 能通过点击唱片切换播放和暂停状态。

#### Scenario: 点击静态唱片开始播放
- **WHEN** 唱片处于暂停状态，用户点击唱片
- **THEN** 音频开始播放，唱片启动旋转动画（4s 一圈，匀速循环）

#### Scenario: 点击旋转唱片暂停
- **WHEN** 唱片处于播放状态，用户点击唱片
- **THEN** 音频暂停，唱片旋转动画停止（缓出效果）

### Requirement: 唱片旋转动画
唱片 SHALL 在播放时以匀速旋转动画呈现，暂停时以缓出动画停止。

#### Scenario: 播放中旋转
- **WHEN** 音频正在播放
- **THEN** 唱片以 `animation: spin 4s linear infinite` 持续旋转

#### Scenario: 暂停时停止
- **WHEN** 音频暂停
- **THEN** 唱片旋转以 ease-out 缓停，不突然跳帧

### Requirement: 歌曲信息展示
唱片中心标签区 SHALL 显示当前歌曲的名称和歌手。

#### Scenario: 正在播放歌曲
- **WHEN** 有歌曲正在播放或已加载
- **THEN** 标签区显示歌曲名（上方）和歌手名（下方）

### Requirement: 歌曲切换
用户 SHALL 能切换到上一首/下一首歌曲。

#### Scenario: 切换下一首
- **WHEN** 用户触发下一首操作（如点击切换按钮或歌曲播放完毕）
- **THEN** 自动播放歌单中下一首歌曲，标签区信息更新

### Requirement: 优雅降级
播放器 SHALL 在音频加载失败时优雅降级。

#### Scenario: MetingJS 加载失败
- **WHEN** MetingJS CDN 不可达或歌单数据获取失败
- **THEN** 显示静态唱片外观，不显示报错信息，唱片不可点击播放
