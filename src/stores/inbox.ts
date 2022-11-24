import { apiClient } from '../utils/apiClient'
import type { AuthorsBy } from '../graphql/types.gen'

export const loadAuthorsBy = async (by: AuthorsBy): Promise<void> => {
  return await apiClient.getAuthorsBy({ by })
}

export const loadChats = async (): Promise<void> => {
  return await apiClient.getChats({ limit: 50, offset: 0 })
}
