export const isDev = import.meta.env.MODE === 'development'

const defaultApiUrl = 'https://v2.discours.io'
export const apiBaseUrl = import.meta.env.PUBLIC_API_URL || defaultApiUrl

console.log(import.meta.env)
