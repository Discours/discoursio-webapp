export const getDescription = (body: string): string => {
  if (!body) {
    return ''
  }
  const descriptionWordsArray = body
    .slice(0, 150) // meta description is roughly 155 characters long
    .replaceAll(/<[^>]*>/g, '')
    .split(' ')
  return descriptionWordsArray.splice(0, descriptionWordsArray.length - 1).join(' ') + '...'
}
