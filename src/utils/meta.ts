const MAX_DESCRIPTION_LENGTH = 150

export const descFromBody = (body: string): string => {
  if (!body) {
    return ''
  }
  const descriptionWordsArray = body
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .split(' ')

  let description = ''
  let i = 0
  while (i < descriptionWordsArray.length && description.length < MAX_DESCRIPTION_LENGTH) {
    description += `${descriptionWordsArray[i]} `
    i++
  }
  return description.trim()
}

export const keywordsFromTopics = (topics: { title: string }[]): string => {
  return topics.map((topic: { title: string }) => topic.title).join(', ')
}
