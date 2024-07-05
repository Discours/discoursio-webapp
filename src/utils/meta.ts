import { Shout } from '~/graphql/schema/core.gen'

const MAX_DESCRIPTION_LENGTH = 150

export const getArticleDescription = (body: string): string => {
  if (!body) {
    return ''
  }
  const descriptionWordsArray = body
    .replaceAll(/<[^>]*>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .split(' ')
  // ¯\_(ツ)_/¯ maybe need to remove the punctuation
  let description = ''
  let i = 0
  while (i < descriptionWordsArray.length && description.length < MAX_DESCRIPTION_LENGTH) {
    description += `${descriptionWordsArray[i]} `
    i++
  }
  return description.trim()
}

export const getArticleKeywords = (shout: Shout): string => {
  return (shout.topics || [])?.map((topic) => topic?.title).join(', ')
}
