export const notChar = /[^\dA-Za-zА-Яа-я]/g
export const allChar = /[\dA-Za-zА-Яа-я]/
export const notLatin = /[^A-Za-z]/
export const notRus = /[^ËА-Яа-яё]/
export const sentenceSeparator = /{!|\?|:|;}\s/
export const cyrillicRegex = /[\u0400-\u04FF]/ // Range for Cyrillic characters

export function findFirstReadableCharIndex(input: string): number {
  for (let i = 0; i < input.length; i++) {
    // Test each character against the "allChar" regex (readable characters).
    if (allChar.test(input[i])) {
      return i // Return the index of the first non-readable character
    }
  }
  return 0 // Return -1 if no non-readable characters are found
}
