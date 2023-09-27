export const isDev = import.meta.env.MODE === 'development'

const defaultApiUrl = 'https://testapi.discours.io'
export const apiBaseUrl = import.meta.env.PUBLIC_API_URL || defaultApiUrl

export const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN || ''
