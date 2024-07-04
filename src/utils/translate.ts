import { Author } from '~/graphql/schema/core.gen'
import { capitalize } from './capitalize'
import { translit } from './ru2en'

export const isCyrillic = (s: string): boolean => {
  const cyrillicRegex = /[\u0400-\u04FF]/ // Range for Cyrillic characters

  return cyrillicRegex.test(s)
}

export const translateAuthor = (author: Author, lng: string) =>
  lng === 'en' && isCyrillic(author?.name || '')
    ? capitalize(translit((author?.name || '').replace(/ё/, 'e').replace(/ь/, '')).replace(/-/, ' '), true)
    : author.name

export const authorLetterReduce = (acc: { [x: string]: Author[] }, author: Author, lng: string) => {
  let letter = ''
  if (!letter && author && author.name) {
    const name =
      translateAuthor(author, lng || 'ru')
        ?.replace(/[^\dA-zА-я]/, ' ')
        .trim() || ''
    const nameParts = name.trim().split(' ')
    const found = nameParts.filter(Boolean).pop()
    if (found && found.length > 0) {
      letter = found[0].toUpperCase()
    }
  }
  if (/[^ËА-яё]/.test(letter) && lng === 'ru') letter = '@'
  if (/[^A-z]/.test(letter) && lng === 'en') letter = '@'

  if (!acc[letter]) acc[letter] = []
  author.name = translateAuthor(author, lng)
  acc[letter].push(author)

  // Sort authors within each letter group alphabetically by name
  acc[letter].sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))

  return acc
}
