import {
  ArmchairIcon as ArmchairIconSvg,
  ArrowDown01Icon as ArrowDown01IconSvg,
  ArrowLeft01Icon as ArrowLeft01IconSvg,
  ArrowRight01Icon as ArrowRight01IconSvg,
  ArrowUp01Icon as ArrowUp01IconSvg,
  ArrowUpRight01Icon as ArrowUpRight01IconSvg,
  AtSignIcon as AtSignIconSvg,
  Bookmark01Icon as Bookmark01IconSvg,
  Camera01Icon as Camera01IconSvg,
  Cancel01Icon as Cancel01IconSvg,
  Clock01Icon as Clock01IconSvg,
  CommandIcon as CommandIconSvg,
  DiscIcon as DiscIconSvg,
  EyeIcon as EyeIconSvg,
  GithubIcon as GithubIconSvg,
  GridIcon as GridIconSvg,
  HandIcon as HandIconSvg,
  HeartIcon as HeartIconSvg,
  Image01Icon as Image01IconSvg,
  Link02Icon as Link02IconSvg,
  LinkedinIcon as LinkedinIconSvg,
  LinkIcon as LinkIconSvg,
  MagicWandIcon as MagicWandIconSvg,
  NavigationIcon as NavigationIconSvg,
  PencilEdit01Icon as PencilEdit01IconSvg,
  PlayIcon as PlayIconSvg,
  PlusSignIcon as PlusSignIconSvg,
  RssIcon as RssIconSvg,
  SendIcon as SendIconSvg,
  Share01Icon as Share01IconSvg,
  SkipBackIcon as SkipBackIconSvg,
  SkipForwardIcon as SkipForwardIconSvg,
  SparklesIcon as SparklesIconSvg,
  Tag01Icon as Tag01IconSvg,
  Video01Icon as Video01IconSvg
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

/**
 * [INPUT]: 依赖 @hugeicons/react 的 HugeiconsIcon 包装器与 @hugeicons/core-free-icons 图标数据
 * [OUTPUT]: 对外提供 HugeIcons 图标组件（命名与调用方习惯一致），替代原 lucide-react
 * [POS]: components/ 的全站图标出口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 *
 * 每个导出都是一个接受 { size, strokeWidth, className, ...svgProps } 的组件，
 * strokeWidth 默认 1.5，颜色跟随 currentColor（HugeiconsIcon 默认），
 * className 中的 Tailwind size-* 会覆盖 SVG 的 width/height 属性，
 * 因此 BoardUI 的 leadingIcon/trailingIcon 组件引用、cloneElement 注入 className
 * 等既有模式无需改动。图标数据命名保留 HugeIcons 原名（如 ArrowLeft01Icon）。
 */

function createIcon(iconSvg) {
  function Icon({ size, strokeWidth = 1.5, ...props }) {
    return <HugeiconsIcon icon={iconSvg} size={size} strokeWidth={strokeWidth} {...props} />
  }
  return Icon
}

export const ArmchairIcon = createIcon(ArmchairIconSvg)
export const ArrowDown01Icon = createIcon(ArrowDown01IconSvg)
export const ArrowLeft01Icon = createIcon(ArrowLeft01IconSvg)
export const ArrowRight01Icon = createIcon(ArrowRight01IconSvg)
export const ArrowUp01Icon = createIcon(ArrowUp01IconSvg)
export const ArrowUpRight01Icon = createIcon(ArrowUpRight01IconSvg)
export const AtSignIcon = createIcon(AtSignIconSvg)
export const Bookmark01Icon = createIcon(Bookmark01IconSvg)
export const Camera01Icon = createIcon(Camera01IconSvg)
export const Cancel01Icon = createIcon(Cancel01IconSvg)
export const Clock01Icon = createIcon(Clock01IconSvg)
export const CommandIcon = createIcon(CommandIconSvg)
export const DiscIcon = createIcon(DiscIconSvg)
export const EyeIcon = createIcon(EyeIconSvg)
export const GithubIcon = createIcon(GithubIconSvg)
export const GridIcon = createIcon(GridIconSvg)
export const HandIcon = createIcon(HandIconSvg)
export const HeartIcon = createIcon(HeartIconSvg)
export const Image01Icon = createIcon(Image01IconSvg)
export const Link02Icon = createIcon(Link02IconSvg)
export const LinkIcon = createIcon(LinkIconSvg)
export const LinkedinIcon = createIcon(LinkedinIconSvg)
export const MagicWandIcon = createIcon(MagicWandIconSvg)
export const NavigationIcon = createIcon(NavigationIconSvg)
export const PencilEdit01Icon = createIcon(PencilEdit01IconSvg)
export const PlayIcon = createIcon(PlayIconSvg)
export const PlusSignIcon = createIcon(PlusSignIconSvg)
export const RssIcon = createIcon(RssIconSvg)
export const SendIcon = createIcon(SendIconSvg)
export const Share01Icon = createIcon(Share01IconSvg)
export const SkipBackIcon = createIcon(SkipBackIconSvg)
export const SkipForwardIcon = createIcon(SkipForwardIconSvg)
export const SparklesIcon = createIcon(SparklesIconSvg)
export const Tag01Icon = createIcon(Tag01IconSvg)
export const Video01Icon = createIcon(Video01IconSvg)
