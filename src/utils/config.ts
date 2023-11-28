export const isDev = import.meta.env.MODE === 'development'

const defaultThumborUrl = 'https://images.discours.io'
export const thumborUrl = import.meta.env.PUBLIC_THUMBOR_URL || defaultThumborUrl

export const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN || ''
