import { Shout } from '../graphql/types.gen'

const MAX_DESCRIPTION_LENGTH = 150
export const getDescription = (body: string): string => {
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
  while (description.length < MAX_DESCRIPTION_LENGTH && description.length < descriptionWordsArray.length) {
    description += descriptionWordsArray[i] + ' '
    i++
  }
  return description.trim()
}

export const getKeywords = (shout: Shout): string => {
  return shout.topics.map((topic) => topic.title).join(', ')
}
