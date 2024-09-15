import { Author } from '~/graphql/schema/core.gen'
import { capitalize } from '~/utils/capitalize'
import { cyrillicRegex, findFirstReadableCharIndex, notChar, notLatin, notRus } from './chars'
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

  if (author?.name) {
    // Get the translated author name and clean it up
    const name = translateAuthor(author, lng || 'ru')?.trim() || ''
    const nameParts = name.split(' ')
    const lastName = nameParts.filter(Boolean).pop()?.replace(notChar, ' ').trim() || '' // Replace non-readable characters

    // Get the last part of the name
    if (lastName && lastName.length > 0) {
      const firstCharIndex = findFirstReadableCharIndex(lastName)

      // Make sure the index is valid before accessing the character
      if (firstCharIndex !== -1) {
        letter = lastName[firstCharIndex].toUpperCase()
      }
    }
  }

  // Handle non-readable letters based on the language
  if (notRus.test(letter) && lng === 'ru') letter = '@'
  if (notLatin.test(letter) && lng === 'en') letter = '@'

  // Initialize the letter group if it doesn't exist
  if (!acc[letter]) acc[letter] = []

  // Translate the author's name for the current language
  author.name = translateAuthor(author, lng)

  // Push the author into the corresponding letter group
  acc[letter].push(author)

  // Sort authors within each letter group alphabetically by name
  acc[letter].sort((a, b) => (a?.name || '').localeCompare(b?.name || ''))

  return acc
}
