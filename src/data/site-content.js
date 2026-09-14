export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pennlam.com'

export const TRUST_PATHS = ['/about', '/contact', '/privacy']

export const PROFILE_URLS = [
  'https://github.com/Penn-Lam',
  'https://www.linkedin.com/in/penn-lam',
  'https://x.com/pennlm',
  'https://bonjour.bio/pennlam'
]

export const HOME_CONTENT = {
  title: 'Penn Lam — AI Agent Developer and Technical Founder',
  introduction: [
    'Hi, I’m Penn Lam (林芃芃), an AI agent developer and technical founder based in Shenzhen, China. I work on infrastructure for agent memory and AI-first social products, with a focus on turning emerging model capabilities into reliable software that people can use.',
    'My background spans computer science, metaverse research, generative AI, frontend and backend engineering, and product building. I approach these areas with a hacker’s mindset: learn by making, test ideas in real workflows, document what survives, and share the useful parts openly.',
    'This site is my public notebook and portfolio. Writing contains technical articles and lessons from building software; Journey records milestones and changes over time; Stack lists tools I have tested in daily work; Workspace documents my working environment; Visual collects photography and AI-generated art; and Bookmarks is a curated reference library.',
    'Use this site when you need Penn’s first-hand writing, project context, tool choices, or public professional profiles. For machine-readable navigation, start with llms.txt or sitemap.xml. For collaboration or a professional introduction, use the verified public channels listed on the Contact page.'
  ]
}

export const TRUST_PAGES = {
  about: {
    title: 'About Penn Lam',
    description: 'Background, work, and interests of Penn Lam, an AI agent developer and technical founder.',
    sections: [
      {
        heading: 'Background',
        paragraphs: [
          'I’m Penn Lam (林芃芃), an AI agent developer and technical founder based in Shenzhen, China. I studied computer science and explored the metaverse before concentrating on generative AI, agent infrastructure, and AI-first products. I care about software that extends personal computing without hiding its limits from the people who rely on it.',
          'My work crosses product engineering and infrastructure. Current interests include durable memory for software agents, the interfaces through which people direct autonomous systems, and social products designed around AI from the beginning rather than added later. I prefer small, testable experiments and clear system boundaries over speculative complexity.'
        ]
      },
      {
        heading: 'What you’ll find here',
        paragraphs: [
          'Pennlam.com is my personal website, public notebook, and portfolio. Writing contains technical articles and practical lessons. Journey records milestones. Stack and Workspace document tools and hardware that have earned a place in my daily work. Visual is a collection of photography and AI-generated art, while Bookmarks collects references I want to return to.',
          'The opinions and recommendations on this site are personal unless a page says otherwise. Older posts reflect what I understood when they were published and may not describe my current view. Dates and source links are included where available so readers and agents can judge context for themselves.'
        ]
      },
      {
        heading: 'Elsewhere',
        paragraphs: [
          'The Contact page lists my verified public profiles. Those profiles are the best way to confirm identity, follow current work, or start a conversation. This is a personal site, not a registered business directory, so it does not publish an invented office address, telephone number, or organization identity.'
        ]
      }
    ]
  },
  contact: {
    title: 'Contact Penn Lam',
    description: 'Verified public channels for contacting Penn Lam about AI agents, software, and collaboration.',
    sections: [
      {
        heading: 'How to reach me',
        paragraphs: [
          'For professional introductions, technical discussion, collaboration, or questions about material published here, contact me through one of the verified public profiles below. LinkedIn is the clearest option for a professional introduction. GitHub is best when the subject is a public repository or a concrete engineering issue. X is suitable for short public conversations and updates.',
          'Please include enough context for me to understand the request: what you are building or researching, why you think I may be relevant, the specific outcome you want, and any useful links. A focused message is easier to evaluate than a generic request. I cannot promise a response or provide individual support for every question.'
        ]
      },
      {
        heading: 'Verified profiles',
        paragraphs: [
          'GitHub: https://github.com/Penn-Lam. LinkedIn: https://www.linkedin.com/in/penn-lam. X: https://x.com/pennlm. Bonjour: https://bonjour.bio/pennlam. These links are also included in the site’s Person structured data so software agents can associate them with this website.'
        ]
      },
      {
        heading: 'Safety and expectations',
        paragraphs: [
          'Do not send passwords, API keys, private customer data, health information, financial information, or other sensitive material through social platforms. I do not list a public phone number, street address, or general-purpose email address on this site. Any account or directory claiming unsupported contact details should not be treated as authoritative without confirmation through the profiles above.'
        ]
      }
    ]
  },
  privacy: {
    title: 'Privacy',
    description: 'Privacy information for pennlam.com, including analytics, external services, and visitor choices.',
    sections: [
      {
        heading: 'Information this site processes',
        paragraphs: [
          'Pennlam.com is a personal website. When you visit, standard hosting logs may process technical information such as your IP address, browser, device, requested pages, referrer, and request time for delivery, reliability, abuse prevention, and aggregate measurement. The site uses Vercel Analytics and Speed Insights, and may use Tinybird analytics when that integration is configured.',
          'If you deliberately submit a bookmark, friend link, comment, authentication request, or other form, the site processes the information you provide in order to perform that action. Do not submit confidential information. The exact third-party service involved depends on the feature and may include Vercel, Contentful, Supabase, GitHub, Cloudinary, Raindrop, or the authentication provider you select.'
        ]
      },
      {
        heading: 'External content and links',
        paragraphs: [
          'Pages may embed or link to services such as GitHub, X, YouTube, SoundCloud, LinkedIn, Cloudinary, and Contentful. Following a link or loading an embed can allow that provider to receive request data under its own privacy terms. This policy does not control third-party sites, and a link is not a promise about their data practices.'
        ]
      },
      {
        heading: 'Choices and retention',
        paragraphs: [
          'You can browse the main published content without creating an account. Browser controls, content blockers, and avoiding optional forms can limit some processing, although blocking required resources may prevent features from working. Operational and submitted data is retained only as long as reasonably needed for the relevant feature, security, legal obligations, or backups maintained by service providers.',
          'This page describes the site as implemented and may be updated when its services change. For a privacy question or a request concerning information you intentionally submitted, use a verified channel on the Contact page and identify the relevant feature and approximate date. Never include extra sensitive data in the request.'
        ]
      }
    ]
  }
}

export const SECTION_SUMMARIES = {
  writing: 'Technical articles and practical notes about software engineering, AI agents, and building products.',
  journey: 'A chronological record of Penn Lam’s work, learning, projects, and milestones.',
  stack: 'Tools and software tested in real daily development and productivity workflows.',
  workspace: 'Penn Lam’s development environment, hardware, work philosophy, and project context.',
  visual: 'A curated portfolio of photography and AI-generated visual work.',
  bookmarks: 'A categorized collection of useful websites, tools, articles, and references.',
  friends: 'Independent builders and writers connected through the open web.',
  musings: 'Short thoughts and reflections published through a public GitHub-based workflow.',
  'sign-in': 'Interactive sign-in page for site features that require authentication.',
  'debug-og': 'Preview page used to verify the website’s Open Graph image.'
}
