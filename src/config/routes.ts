export const ROUTES = {
  home: '/',
  inbox: '/inbox',
  connect: '/connect',
  create: '/edit/new',
  edit: '/edit/:shoutId',
  editSettings: '/edit/:shoutId/settings',
  drafts: '/edit',
  topics: '/topics',
  topic: '/topic/:slug',
  authors: '/author',
  author: '/author/:slug',
  authorComments: '/author/:slug/comments',
  authorAbout: '/author/:slug/about',
  feed: '/feed',
  feedMy: '/feed/my',
  feedNotifications: '/feed/noticed',
  feedDiscussions: '/feed/discussed',
  feedBookmarks: '/feed/bookmarked',
  feedCollaborations: '/feed/coauthored',
  search: '/search/:q?',
  dogma: '/guide/dogma',
  discussionRules: '/about/discussion-rules',
  guide: '/guide',
  help: '/guide/support',
  manifest: '/guide/manifest',
  partners: '/guide/partners',
  principles: '/guide/principles',
  projects: '/guide/projects',
  termsOfUse: '/about/terms-of-use',
  thanks: '/guide/thanks',
  expo: '/expo/:layout?',
  profileSettings: '/profile',
  profileSecurity: '/profile/security',
  profileSubscriptions: '/profile/subs',
  fourOuFour: '/404',
  article: '/:slug'
} as const
