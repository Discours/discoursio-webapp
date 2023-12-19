export const isCyrillic = (s: string): boolean => {
  const cyrillicRegex = /[\u0400-\u04FF]/ // Range for Cyrillic characters

  return cyrillicRegex.test(s)
}
