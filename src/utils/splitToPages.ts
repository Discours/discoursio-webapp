export function splitToPages<T>(arr: T[], startIndex: number, pageSize: number): T[][] {
  return arr.slice(startIndex).reduce((acc, article, index) => {
    if (index % pageSize === 0) {
      acc.push([])
    }

    acc?.at(-1)?.push(article)
    return acc
  }, [] as T[][])
}
