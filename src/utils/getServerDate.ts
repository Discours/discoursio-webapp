export const getServerDate = (date: Date): string => {
  // 2023-12-31
  return date.toISOString().slice(0, 10)
}
