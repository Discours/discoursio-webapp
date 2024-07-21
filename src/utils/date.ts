export const getShortDate = (date: Date) => date.toISOString().slice(0, 10) // 2023-12-31
export const getUnixtime = (date: Date) => Math.floor(date.getTime() / 1000) as number
