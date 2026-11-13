# shelves/
> L2 | 父级: /CLAUDE.md

/bookmarks 下三个收藏夹的实物陈列：Art 是画廊墙，books 是书架，Music 是唱片架加一台唱机。
其余收藏夹仍用卡片列表（`bookmark-list.jsx`）。

## 数据从哪来
Art、Music: 本地。条目在 `src/data/shelves/art.json`、`music.json`，封面在 `public/shelves/<slug>/`，由 `lib/local-shelves.js` 读出。不从 Raindrop 同步。
books: `lib/bookshelf.js`。微信读书优先；未配置 `WEREAD_API_KEY` 或请求失败时回退到 Raindrop 的 books 收藏夹（id 登记在 `lib/constants.js` 的 `BOOKMARK_SHELVES`）。
三者和 Raindrop 收藏夹一起出现在 /bookmarks 的列表里，列表由 `lib/bookmark-collections.js` 拼出。

## 成员清单
index.js: 出口 `BookmarkShelf`，按 kind 选陈列，条目为空时给一行空状态。
gallery-wall.js: 画廊墙。挂线、钉子、画框、卡纸、画芯，下面一块只写标题的展签。
bookshelf.js: 书架。书封面朝外立在层板上，页面上不印书名。
record-shelf.js: 唱片架。顶部是 `vinyl-player/turntable.js` 的唱机，下面是封套加露出一截的黑胶。
record-disc.js: 客户端组件，封套里的黑胶。有音源的可以拖到唱机上或点一下飞过去；用 framer-motion 做拖拽和弹簧。
shelf-link.js: 外壳，有链接是 `a`，没有链接是 `span`；标题只进 aria-label 和悬停提示。
shelf-image.js: 客户端组件。封面加载失败时依次换备用地址、换无图样式。
shelves.module.css: 三种陈列的全部样式。

## 约定
只画实物：不显示摘要、域名、标签，不带标签筛选和分页，条目一次铺开。
三种陈列只认一种条目形状 `{ id, title, subtitle, cover, fallbackCover, href, width, height, audio }`。
交互按实物来：画绕钉子摆动、玻璃反光跟指针走；书被抽出时两边的书让开；黑胶滑出封套转动，能拿到唱机上。
指针位置由 `components/pointer-tilt.js` 写成 `--px`、`--py`，样式表决定怎么用。跟随指针的变换不加 CSS 过渡，否则会发黏。
被拖拽的黑胶不能放在带 transform 的祖先里：那会新建层叠上下文，黑胶就盖不过唱机和别的封套。
外站封面一律带 `referrerPolicy="no-referrer"`。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
