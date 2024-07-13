export function paginate<T>(arr: T[], startIndex: number, pageSize: number): T[][] {
  return arr.slice(startIndex).reduce((acc, item, index) => {
    if (index % pageSize === 0) {
      acc.push([])
    }

    acc?.at(-1)?.push(item)
    return acc
  }, [] as T[][])
}
