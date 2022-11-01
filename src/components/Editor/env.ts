export const isDark = () =>
  typeof window !== undefined && window.matchMedia('(prefers-color-scheme: dark)').matches
