import { Author } from '~/graphql/schema/core.gen'
import { capitalize } from '~/utils/capitalize'
import { allChars, cyrillicRegex, enChars, ruChars } from './chars'
import { translit } from './translit'

export const isCyrillic = (s: string): boolean => {
  return cyrillicRegex.test(s)
}

export const translateAuthor = (author: Author, lng: string) =>
  lng === 'en' && isCyrillic(author?.name || '')
    ? capitalize(
        translit((author?.name || '').replaceAll('ё', 'e').replaceAll('ь', '')).replaceAll('-', ' '),
        true
      )
    : author.name

export const authorLetterReduce = (acc: { [x: string]: Author[] }, author: Author, lng: string) => {
  let letter = ''
  if (!letter && author && author.name) {
    const name =
      translateAuthor(author, lng || 'ru')
        ?.replace(allChars, ' ')
        .trim() || ''
    const nameParts = name.trim().split(' ')
    const found = nameParts.filter(Boolean).pop()
    if (found && found.length > 0) {
      letter = found[0].toUpperCase()
    }
  }
  if (ruChars.test(letter) && lng === 'ru') letter = '@'
  if (enChars.test(letter) && lng === 'en') letter = '@'

  if (!acc[letter]) acc[letter] = []
  author.name = translateAuthor(author, lng)
  acc[letter].push(author)

  // Sort authors within each letter group alphabetically by name
  acc[letter].sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))

  return acc
}
