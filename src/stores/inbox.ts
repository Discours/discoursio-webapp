import { apiClient } from '../utils/apiClient'

export const loadRecipients = async (by = {}): Promise<void> => {
  return await apiClient.getRecipients(by)
}

export const loadChats = async (): Promise<void> => {
  return await apiClient.getChats({ limit: 50, offset: 0 })
}
