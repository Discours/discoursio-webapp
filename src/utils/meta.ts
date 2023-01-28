export const getDescription = (body: string) => {
  const descriptionWordsArray = body
    .substring(0, 150)
    .replaceAll(/<[^>]*>/g, '')
    .split(' ')
  return descriptionWordsArray.splice(0, descriptionWordsArray.length - 1).join(' ') + '...'
}
