// Usage in tsx: {getNumeralsDeclension(NUMBER, ['яблоко', 'яблока', 'яблок'])}
export const getNumeralsDeclension = (number: number, words: string[], cases = [2, 0, 1, 1, 1, 2]) =>
  words[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]]
