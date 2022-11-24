import { apiClient } from '../utils/apiClient'

export const loadAuthorsBy = async (by?: any): Promise<void> => {
  return await apiClient.getAuthorsBy({ by })
}

export const loadChats = async (): Promise<void> => {
  return await apiClient.getChats({ limit: 0, offset: 50 })
}
