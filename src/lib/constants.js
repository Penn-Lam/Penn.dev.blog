import {
  ArmchairIcon,
  Bookmark01Icon,
  GithubIcon,
  HandIcon,
  Image01Icon,
  LinkedinIcon,
  LinkIcon,
  MagicWandIcon,
  NavigationIcon,
  PencilEdit01Icon,
  SparklesIcon,
  XLogoIcon
} from '@/components/icons'

export const PROFILES = {
  twitter: {
    title: 'Twitter',
    username: 'Penn_Lam', // 请替换为您的 Twitter 用户名
    url: 'https://x.com/pennlm', // 请替换为您的 Twitter 个人资料 URL
    icon: <XLogoIcon size={16} />
  },
  github: {
    title: 'GitHub',
    url: 'https://github.com/Penn-Lam',
    icon: <GithubIcon size={16} />
  },
  linkedin: {
    title: 'LinkedIn',
    url: 'https://www.linkedin.com/in/penn-lam', // 请替换为您的 LinkedIn 个人资料 URL
    icon: <LinkedinIcon size={16} />
  },
  bonjour: {
    title: 'Bonjour',
    url: 'https://bonjour.bio/pennlam',
    icon: <HandIcon size={16} />
  }
  /* medium: {
    title: 'Medium',
    url: 'https://suyalcinkaya.medium.com'
  }, */
  /* instagram: {
    title: 'Instagram',
    url: 'https://www.instagram.com/jgrmn',
    icon: <InstagramIcon size={16} />
  }, */
  /* soundcloud: {
    title: 'Soundcloud',
    url: 'https://soundcloud.com/jagerman'
  }, */
  /* youtube: {
    title: 'YouTube',
    url: 'https://www.youtube.com/c/jagermanmusic',
    icon: <YoutubeIcon size={16} />
  }, */
  /* bluesky: {
    title: 'Bluesky',
    url: 'https://staging.bsky.app/profile/onur.dev'
  }, */
  /* readcv: {
    title: 'Read.cv',
    url: 'https://read.cv/onur'
  }, */
  /* pinterest: {
    title: 'Pinterest',
    url: 'https://nl.pinterest.com/onurschu'
  } */
}
// 支持多个 Twitter 收藏夹
export const TWEETS_COLLECTION_IDS = [56369164]

export const COLLECTION_IDS = [
  56865149, // AI
  56369365, // books
  56374013, // Kits
  57484893, // Tools
  56376224, // Icons
  58457558, // Blogs
  56815543, // Frontend
  62739440, // Backend
  62741470, // Infra & Hosting
  66769404, // Communication
  66769394, // Monetization
  56815657, // Art
  60507989, // Music
  56815349, // Reading
  ...TWEETS_COLLECTION_IDS // 支持多个 Twitter 收藏夹
]

export const LINKS = [
  {
    href: '/',
    label: 'Home',
    icon: <SparklesIcon size={16} />
  },
  {
    href: '/writing',
    label: 'Writing',
    icon: <PencilEdit01Icon size={16} />
  },
  {
    href: '/journey',
    label: 'Journey',
    icon: <NavigationIcon size={16} />
  },
  {
    href: '/stack',
    label: 'Stack',
    icon: <MagicWandIcon size={16} />
  },
  {
    href: '/workspace',
    label: 'Workspace',
    icon: <ArmchairIcon size={16} />
  },
  {
    href: '/visual',
    label: 'Visual',
    icon: <Image01Icon size={16} />
  },
  {
    href: '/bookmarks',
    label: 'Bookmarks',
    icon: <Bookmark01Icon size={16} />
  },
  {
    href: '/friends',
    label: 'Friends',
    icon: <LinkIcon size={16} />
  }
]

// 个人空间数据结构
export const PERSONAL_SPACE_SECTIONS = {}

export const SCROLL_AREA_ID = 'scroll-area'
export const MOBILE_SCROLL_THRESHOLD = 20
export const SUPABASE_TABLE_NAME = 'pages'

export const SUBMIT_BOOKMARK_FORM_TITLE = 'Submit a bookmark'
export const SUBMIT_BOOKMARK_FORM_DESCRIPTION =
  "Send me a website you like and if I like it too, you'll see it in the bookmarks list. With respect, please do not submit more than 5 websites a day."

export const CONTENT_TYPES = {
  PAGE: 'page',
  POST: 'post',
  LOGBOOK: 'logbook'
}
