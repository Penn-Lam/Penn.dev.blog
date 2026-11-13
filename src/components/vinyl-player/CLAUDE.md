# vinyl-player/
> L2 | 父级: /CLAUDE.md

/bookmarks/music 顶部的唱机，以及全站共用的黑胶唱片外观。侧栏不再有播放器。

## 成员清单
turntable.js: 客户端组件，唱机本体。转盘、唱臂、读数窗、上一首/播放/下一首/退出四个键；按需加载 APlayer 与 MetingJS。
turntable-context.js: 客户端组件，`TurntableProvider` 与 `useTurntable`。唱机和唱片架上的唱片靠它共享“转盘上是哪张、转盘在哪、有没有唱片被拿着”。
turntable.module.css: 唱机样式。转动用 `animation-play-state` 控制；唱臂落点按几何算过。
use-meting.js: MetingJS 桥接 hook，隐藏 `<meting-js>` Web Component，暴露播放控制。换音源靠 `sourceKey` 重建实例。
vinyl-record.js: 纯展示组件，黑胶唱片 DOM 结构（纹路、标签、主轴）。唱机和 `shelves/record-disc.js` 都用它。
vinyl-record.module.css: 唱片纹路渐变与标签排版；尺寸由调用方的 `--vinyl-size` 决定，默认 140px。

## 音源写法
唱片的音源写在 `src/data/shelves/music.json` 每条的 `audio` 字段里，原样作为 `<meting-js>` 的属性：
- 网易云专辑、歌单、单曲：`{ "server": "netease", "type": "album" | "playlist" | "song", "id": "<数字 id>" }`
- 直接的音频文件：`{ "name": "<曲名>", "artist": "<作者>", "url": "<音频地址>" }`
没有 `audio` 的唱片只陈列，不能拿起。
转盘上没有唱片时播放默认歌单，id 来自环境变量 `NEXT_PUBLIC_NETEASE_PLAYLIST_ID`。

## 约定
APlayer 只有 `on` 没有 `off`：不要在清理函数里解绑事件，旧实例随 `<meting-js>` 卸载而销毁。
播放脚本在第一次按播放或放上唱片后才加载；离开页面声音即停。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
