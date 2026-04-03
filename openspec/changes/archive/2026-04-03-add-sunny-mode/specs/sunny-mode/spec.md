## ADDED Requirements

### Requirement: Sunny Mode Toggle
主页 SHALL 提供一个 toggle 按钮，点击后开启/关闭阳光光影覆盖效果。按钮 MUST 使用太阳图标，激活状态下 MUST 有视觉区分（旋转 + 变色）。

#### Scenario: 用户开启 sunny mode
- **WHEN** 用户点击太阳图标 toggle 按钮
- **THEN** 阳光光影覆盖层以 0.8s 淡入动画显示在页面内容之上

#### Scenario: 用户关闭 sunny mode
- **WHEN** 用户再次点击 toggle 按钮
- **THEN** 覆盖层以 0.8s 淡出动画消失

#### Scenario: toggle 按钮不阻挡内容交互
- **WHEN** sunny mode 处于开启状态
- **THEN** 覆盖层 MUST 设置 `pointer-events: none`，页面所有链接和按钮正常可点击

### Requirement: 百叶窗阴影效果
覆盖层 SHALL 包含百叶窗阴影，通过 repeating-linear-gradient 实现水平条纹 + matrix3d 透视变换模拟斜射角度。百叶窗 opacity MUST ≤ 0.07 以避免遮挡内容。

#### Scenario: 百叶窗视觉表现
- **WHEN** sunny mode 开启
- **THEN** 页面显示半透明的水平百叶窗条纹阴影，具有透视倾斜效果

### Requirement: 树叶风动效果
覆盖层 SHALL 包含树叶纹理层，使用 `leaves.png` 素材 + SVG feTurbulence/feDisplacementMap 滤镜实现有机风动效果。树叶 MUST 有 billow 动画模拟微风中的起伏。

#### Scenario: 树叶动态表现
- **WHEN** sunny mode 开启
- **THEN** 树叶纹理以 8s 循环的 billow 动画缓慢起伏，SVG 湍流滤镜以 16s 循环产生风吹位移

### Requirement: 渐进模糊扩散
覆盖层 SHALL 包含 4 层渐进模糊层，每层使用不同强度的 backdrop-filter blur + mask-image 渐变，模拟光线从窗户到室内的扩散衰减。

#### Scenario: 模糊层次表现
- **WHEN** sunny mode 开启
- **THEN** 靠近「窗户」方向的区域模糊较轻（6px），远离「窗户」的区域模糊较重（最高 96px），形成自然的景深梯度

### Requirement: 光晕反射
覆盖层 SHALL 包含光晕层，使用 linear-gradient 在画面角落模拟光线反射。opacity MUST ≤ 0.5。

#### Scenario: 光晕视觉表现
- **WHEN** sunny mode 开启
- **THEN** 画面角落区域出现柔和的暖色光晕

### Requirement: 状态持久化
用户的 sunny mode 偏好 SHALL 持久化到 localStorage。页面刷新后 MUST 恢复上次的状态。

#### Scenario: 刷新后保持状态
- **WHEN** 用户开启 sunny mode 后刷新页面
- **THEN** 页面加载后 sunny mode 自动开启，无需重新点击

#### Scenario: 首次访问默认关闭
- **WHEN** 用户首次访问（localStorage 无记录）
- **THEN** sunny mode 默认关闭

### Requirement: 无障碍与性能
组件 MUST 尊重 `prefers-reduced-motion` 媒体查询。在 reduce motion 模式下，所有动画 MUST 禁用，仅保留静态光影效果。

#### Scenario: 减少动画偏好
- **WHEN** 用户系统设置了 `prefers-reduced-motion: reduce`
- **THEN** 所有 CSS 动画和 SVG filter animate 停止，覆盖层以静态形式显示

#### Scenario: 不阻塞主线程
- **WHEN** sunny mode 开启
- **THEN** 所有动画通过 CSS/SVG 实现，不使用 JS requestAnimationFrame 或 setInterval
