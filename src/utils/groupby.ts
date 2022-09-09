export const groupByName = (arr: any[]) => {
  return arr.reduce(
    (acc, tt) => {
      let c = (tt.name || '')
        .replace(/[^\d A-Za-zА-я]/g, '')
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
      'A-Z': []
    }
  )
}

export const groupByTitle = (arr: any[]) => {
  return arr.reduce(
    (acc, tt) => {
      let c = (tt.title || '')
        .replace(/[^\d A-Za-zА-я]/g, '')
        .slice(0, 1)
        .toUpperCase()
      if (/[^А-я]/.test(c)) c = 'A-Z'
      else if (!acc[c]) acc[c] = []
      acc[c].push(tt)
      return acc
    },
    {
      'A-Z': []
    }
  )
}
