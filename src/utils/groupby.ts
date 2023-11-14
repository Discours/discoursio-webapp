import type { Author, Shout, Topic } from '../graphql/types.gen'

export const groupByName = (arr: Author[]) => {
  return arr.reduce(
    (acc, tt) => {
      let c = (tt.name || '')
        .replaceAll(/[^\d A-Za-zА-я]/g, '')
        .split(' ')
        .pop()
        .slice(0, 1)
        .toUpperCase()
      if (/[^А-я]/.test(c)) c = 'A-Z'
      else if (!acc[c]) acc[c] = []
      acc[c].push(tt)
      return acc
    },
    {
      'A-Z': [],
    },
  )
}

export const groupByTitle = (arr: (Shout | Topic)[]) => {
  return arr.reduce(
    (acc, tt) => {
      let c = (tt.title || '')
        .replaceAll(/[^\d A-Za-zА-я]/g, '')
        .slice(0, 1)
        .toUpperCase()
      if (/[^А-я]/.test(c)) c = 'A-Z'
      else if (!acc[c]) acc[c] = []
      acc[c].push(tt)
      return acc
    },
    {
      'A-Z': [],
    },
  )
}
