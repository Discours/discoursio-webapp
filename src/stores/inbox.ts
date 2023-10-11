import { inboxClient } from '../utils/apiClient'
import type { MessagesBy } from '../graphql/types.gen'

export const loadRecipients = async (by = {}): Promise<void> => {
  return await inboxClient.loadRecipients(by)
}

export const loadMessages = async (by: MessagesBy): Promise<void> => {
  return await inboxClient.loadChatMessages({ by, limit: 50, offset: 0 })
}
