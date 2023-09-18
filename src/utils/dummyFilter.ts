import { translit } from './ru2en'
import { Author, Topic } from '../graphql/types.gen'

type SearchData = Array<Author | Topic>

const prepareQuery = (searchQuery, lang) => {
  const q = searchQuery.toLowerCase()
  if (q.length === 0) return ''
  return lang === 'ru' ? translit(q) : q
}

const stringMatches = (str, q, lang) => {
  const preparedStr = lang === 'ru' ? translit(str.toLowerCase()) : str.toLowerCase()
  return preparedStr.split(' ').some((word) => word.startsWith(q))
}

export const dummyFilter = (data: SearchData, searchQuery: string, lang: 'ru' | 'en'): SearchData => {
  const q = prepareQuery(searchQuery, lang)
  if (q.length === 0) return data

  return data.filter((item) => {
    const slugMatches = item.slug && item.slug.split('-').some((w) => w.startsWith(q))
    if (slugMatches) return true

    if ('title' in item) {
      return stringMatches(item.title, q, lang)
    }

    if ('name' in item) {
      return stringMatches(item.name, q, lang) || (item.bio && stringMatches(item.bio, q, lang))
    }
    // If it does not match any of the 'slug', 'title', 'name' , 'bio' fields
    // current element should not be included in the filtered array
    return false
  })
}
