export const isDev = import.meta.env.MODE === 'development'

const defaultApiUrl = 'https://testapi.discours.io'
// export const apiBaseUrl = import.meta.env.PUBLIC_API_URL || defaultApiUrl
export const apiBaseUrl = 'https://v2.discours.io'

const defaultThumborUrl = 'https://images.discours.io'
export const thumborUrl = import.meta.env.PUBLIC_THUMBOR_URL || defaultThumborUrl

const defaultThumborUrl = 'https://images.discours.io'
export const thumborUrl = import.meta.env.PUBLIC_THUMBOR_URL || defaultThumborUrl

export const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN || ''
