# vinyl-player/
> L2 | 父级: /CLAUDE.md

/bookmarks/music 顶部的唱机，以及全站共用的黑胶唱片外观。侧栏不再有播放器。

## 成员清单
turntable.js: 客户端组件，唱机本体。方形浅灰机身、居中的彩胶唱片（点它播放/暂停）、右上角白色唱臂、左下角音量旋钮；机身旁边是曲名和上一首/播放/下一首/退出四个键；按需加载 APlayer 与 MetingJS。
turntable-context.js: 客户端组件，`TurntableProvider` 与 `useTurntable`。唱机和唱片架上的唱片靠它共享“转盘上是哪张、转盘在哪、有没有唱片被拿着、哪些唱片这位访客播不了”。
turntable.module.css: 唱机样式。材质不在这里画，只负责摆放、会变的部件（唱片、刻度、铭牌）和动效；部件按机身边长的百分比定位，数值量自原图。
use-meting.js: MetingJS 桥接 hook，隐藏 `<meting-js>` Web Component，暴露播放控制和音量，并把“这一首取不到音频”报给唱机。换音源靠 `sourceKey` 重建实例。
vinyl-record.js: 纯展示组件，黑胶唱片 DOM 结构（纹路、标签、主轴）。唱片架上封套里的黑胶（`shelves/record-disc.js`）用它；唱机上的唱片是 turntable 自己画的彩胶。
vinyl-record.module.css: 唱片纹路渐变与标签排版；尺寸由调用方的 `--vinyl-size` 决定，默认 140px。

## 音源
唱机始终放站点的网易云歌单，id 是 `lib/constants.js` 的 `NETEASE_PLAYLIST_ID`（环境变量 `NEXT_PUBLIC_NETEASE_PLAYLIST_ID`）。
架上的唱片是这份歌单里的歌，每张带 `audio: { playlistIndex }`，记着自己是歌单的第几首。拖上唱机时不换音源，只让播放器跳到那一首；歌单播到别的歌时，唱机在架上找到对应那张换到转盘上。
架上的顺序和播放器歌单的顺序必须一致：两边都出自 `lib/netease.js` 的同一次请求。播放器经本站的 `/api/playlist` 取歌单（`<meting-js>` 的 `api` 属性），不直接请求 Meting 公共接口。
音频地址是网易云外链（`music.163.com/song/media/outer/url?id=…`），由访客的浏览器自己取。Meting 公共接口给的地址由它的海外服务器匿名代取，只在中国大陆有版权的歌全部 404，所以不用。
能不能播取决于访客：大陆访客能播无限制和大陆版权的歌，海外访客只能播无限制的歌；会员专享和已下架的歌谁都播不了。服务端判断不了，只能播了才知道。
取不到音频时，APlayer 在 2 秒后自己跳到下一首（不要再手动跳，会连跳两首）；唱机把架上对应的唱片记进 `unplayableIds`，那张唱片变灰、不能再拿起。这份记录只在本次访问里有效。
外链先 302 到一个 `http://` 的 CDN 地址。HTTPS 页面上靠浏览器把音频请求自动升级成 HTTPS，CDN 支持 HTTPS。
本地 `music.json` 里的条目（歌单取不到时的回退）可以带另一种 `audio`，原样作为 `<meting-js>` 的属性，例如 `{ "name", "artist", "url" }`；这种唱片会让唱机换音源。没有 `audio` 的唱片只陈列，不能拿起。

## 约定
机身（含投影和旋钮）与唱臂是从 Figma 社区文件 Vinyl player component (Community) 的设计稿里导出的原图，放在 `public/turntable/`。原稿上的作者标志和唱片封面没有用。
出处：Lotta Anidi，https://www.figma.com/community/file/1650279101562799100/vinyl-player-component ，许可 CC BY 4.0。许可要求署名并注明改动，所以唱机旁边那行 “Turntable design by Lotta Anidi, adapted, CC BY 4.0” 不能删。
导出方法见 `public/CLAUDE.md`。机身拼缝的强度是原稿的一半。
有封面时整张唱片印封面；没有封面时是黑胶。
旋钮是真的音量：拖动、方向键都能调，刻度亮到当前音量为止。
APlayer 只有 `on` 没有 `off`：不要在清理函数里解绑事件，旧实例随 `<meting-js>` 卸载而销毁。
播放脚本在第一次按播放或放上唱片后才加载；离开页面声音即停。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
