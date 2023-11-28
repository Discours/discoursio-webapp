import type { MessagesBy } from '../graphql/schema/chat.gen'

import { inboxClient } from '../graphql/client/chat'

export const loadRecipients = async (by = {}): Promise<void> => {
  return await inboxClient.loadRecipients(by)
}

export const loadMessages = async (by: MessagesBy): Promise<void> => {
  return await inboxClient.loadChatMessages({ by, limit: 50, offset: 0 })
}
