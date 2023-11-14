import type { MessagesBy } from '../graphql/types.gen'

import { apiClient } from '../utils/apiClient'

export const loadRecipients = async (by = {}): Promise<void> => {
  return await apiClient.getRecipients(by)
}

export const loadMessages = async (by: MessagesBy): Promise<void> => {
  return await apiClient.getChatMessages({ by, limit: 50, offset: 0 })
}
