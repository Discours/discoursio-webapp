export const isDev = import.meta.env.MODE === 'development'

const defaultThumborUrl = 'https://images.discours.io'
export const cdnUrl = 'https://cdn.discours.io'
export const thumborUrl = import.meta.env.PUBLIC_THUMBOR_URL || defaultThumborUrl

export const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN || ''
export const GLITCHTIP_DSN = import.meta.env.PUBLIC_GLITCHTIP_DSN || ''

const defaultSearchUrl = 'https://search.discours.io'
export const searchUrl = import.meta.env.PUBLIC_SEARCH_URL || defaultSearchUrl

const defaultCoreUrl = 'https://core.discours.io'
export const coreApiUrl = import.meta.env.PUBLIC_CORE_API || defaultCoreUrl

const defaultChatUrl = 'https://chat.discours.io'
export const chatApiUrl = import.meta.env.PUBLIC_CHAT_API || defaultChatUrl

const defaultAuthUrl = 'https://auth.discours.io'
export const authApiUrl = import.meta.env.PUBLIC_AUTH_API || defaultAuthUrl
