export const getDescription = (body: string) => {
  if (!body) return null
  const descriptionWordsArray = body
    .slice(0, 150)
    .replaceAll(/<[^>]*>/g, '')
    .split(' ')
  return descriptionWordsArray.splice(0, descriptionWordsArray.length - 1).join(' ') + '...'
}
