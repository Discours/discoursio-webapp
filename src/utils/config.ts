export const isDev = import.meta.env.MODE === 'development'

const defaultApiUrl = 'https://testapi.discours.io'
export const apiBaseUrl = import.meta.env.PUBLIC_API_URL || defaultApiUrl
