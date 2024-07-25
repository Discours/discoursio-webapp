export const isDev = import.meta.env.MODE === 'development'
export const cdnUrl = 'https://cdn.discours.io'
export const thumborUrl = import.meta.env.PUBLIC_THUMBOR_URL || 'https://images.discours.io'
export const reportDsn = import.meta.env.PUBLIC_GLITCHTIP_DSN || import.meta.env.PUBLIC_SENTRY_DSN || ''
export const coreApiUrl = import.meta.env.PUBLIC_CORE_API || 'https://core.discours.io'
export const chatApiUrl = import.meta.env.PUBLIC_CHAT_API || 'https://inbox.discours.io'
export const authApiUrl = import.meta.env.PUBLIC_AUTH_API || 'https://auth.discours.io/graphql'
export const sseUrl = import.meta.env.PUBLIC_REALTIME_EVENTS || 'https://connect.discours.io'