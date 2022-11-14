export const isDev = import.meta.env.VERCEL_ENV !== 'production'
export const apiBaseUrl =
  import.meta.env.PUBLIC_API_URL ||
  import.meta.env.API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8080'
