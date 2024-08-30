export const getRandomItemsFromArray = <T>(items: T[], count = 10): T[] => {
  if (!Array.isArray(items)) {
    return []
  }

  const shuffledItems = [...items].sort(() => 0.5 - Math.random())
  return shuffledItems.slice(0, count)
}
