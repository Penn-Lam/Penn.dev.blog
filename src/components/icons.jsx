'use client'

/**
 * [INPUT]: 依赖 @phosphor-icons/react 的图标组件
 * [OUTPUT]: 对外提供 Phosphor 图标组件（保留 HugeIcons 风格的导出名），全站图标统一出口
 * [POS]: components/ 的全站图标出口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 *
 * 图标库为 Phosphor（https://phosphoricons.com/）。组件 API：
 * `<Icon size={20} weight="regular" color="currentColor" className ... />`。
 *
 * 注意：'use client' 是必需的 —— @phosphor-icons/react 的 IconBase 在模块顶层
 * 调用 React.createContext（IconContext），而本出口被 layout.js / constants.js 等
 * 服务端模块间接引入（PROFILES/LINKS 数据中的图标元素）；不标记 client 会在
 * RSC 环境执行 createContext 而崩溃。图标本身是纯展示组件，client 边界无行为差异。
 *
 * - `weight` 默认即 "regular"（Phosphor IconBase 的 fallback），不设 IconContext 即恒定。
 * - `color` 默认 "currentColor"：文本色 token（text-text-primary / text-white 等）直接生效，
 *   loading spinner 的颜色继承无需额外处理。
 * - 不传 `size` 时 svg 不渲染 width/height 属性，调用处 className 里的 Tailwind size-*、h-*、w-*
 *   完全控制尺寸；传 `size={N}` 时渲染对应属性（既有调用如 constants.js 的 size={16}）。
 * - className / aria-hidden / fill 等经 rest 透传到 svg，BoardUI leadingIcon/trailingIcon
 *   组件引用、cloneElement 注入 className 等模式无需改动。
 *
 * 导出名沿用 HugeIcons 时期命名（ArrowUpRight01Icon、Bookmark01Icon 等），23 个调用方
 * 文件零改动。语义映射：chevron/翻页用 Caret*（ArrowDown01/ArrowUp01/ArrowLeft01/
 * ArrowRight01 的调用处为展开收起与翻页），外链 ↗ 用 ArrowUpRight，AtSignIcon 的
 * Phosphor 名为 At，SparklesIcon 的 Phosphor 名为 Sparkle。
 */

export {
  Armchair as ArmchairIcon,
  CaretDown as ArrowDown01Icon,
  CaretLeft as ArrowLeft01Icon,
  CaretRight as ArrowRight01Icon,
  CaretUp as ArrowUp01Icon,
  ArrowUpRight as ArrowUpRight01Icon,
  At as AtSignIcon,
  Bookmark as Bookmark01Icon,
  Camera as Camera01Icon,
  X as Cancel01Icon,
  Clock as Clock01Icon,
  Command as CommandIcon,
  Disc as DiscIcon,
  Eye as EyeIcon,
  GithubLogo as GithubIcon,
  SquaresFour as GridIcon,
  Hand as HandIcon,
  Heart as HeartIcon,
  Image as Image01Icon,
  LinkSimple as Link02Icon,
  LinkedinLogo as LinkedinIcon,
  Link as LinkIcon,
  MagicWand as MagicWandIcon,
  NavigationArrow as NavigationIcon,
  PencilLine as PencilEdit01Icon,
  Play as PlayIcon,
  Plus as PlusSignIcon,
  Rss as RssIcon,
  PaperPlaneTilt as SendIcon,
  ShareNetwork as Share01Icon,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  Sparkle as SparklesIcon,
  Tag as Tag01Icon,
  VideoCamera as Video01Icon,
  XLogo as XLogoIcon
} from '@phosphor-icons/react'
