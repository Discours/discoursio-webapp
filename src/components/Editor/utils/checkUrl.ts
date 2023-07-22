export const checkUrl = (url) => {
  try {
    new URL(url)
    return url
  } catch {
    return `https://${url}`
  }
}
