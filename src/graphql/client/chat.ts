// inbox
import { createGraphQLClient } from '../createGraphQLClient'
import createChat from '../mutation/chat/chat-create'
import deleteChat from '../mutation/chat/chat-delete'
import markAsRead from '../mutation/chat/chat-mark-as-read'
import createChatMessage from '../mutation/chat/chat-message-create'
import deleteChatMessage from '../mutation/chat/chat-message-delete'
import updateChatMessage from '../mutation/chat/chat-message-update'
import updateChat from '../mutation/chat/chat-update'
import chatMessagesLoadBy from '../query/chat/chat-messages-load-by'
import myChats from '../query/chat/chats-load'
import {
  Chat,
  MutationCreate_ChatArgs,
  MutationCreate_MessageArgs,
  MutationDelete_ChatArgs,
  MutationDelete_MessageArgs,
  MutationMark_As_ReadArgs,
  MutationUpdate_ChatArgs,
  MutationUpdate_MessageArgs,
  QueryLoad_ChatsArgs,
  QueryLoad_Messages_ByArgs,
} from '../schema/chat.gen'
import { chatApiUrl } from '../../utils/config'

export const inboxClient = {
  private: null,
  connect: (token: string) => (inboxClient.private = createGraphQLClient(chatApiUrl, token)),

  loadChats: async (options: QueryLoad_ChatsArgs): Promise<Chat[]> => {
    const resp = await inboxClient.private.query(myChats, options).toPromise()
    return resp.data.load_chats.chats
  },

  createChat: async (options: MutationCreate_ChatArgs) => {
    const resp = await inboxClient.private.mutation(createChat, options).toPromise()
    return resp.data.create_chat
  },

  markAsRead: async (options: MutationMark_As_ReadArgs) => {
    const resp = await inboxClient.private.mutation(markAsRead, options).toPromise()
    return resp.data.mark_as_read
  },

  updateChat: async (options: MutationUpdate_ChatArgs) => {
    const resp = await inboxClient.private.mutation(updateChat, options).toPromise()
    return resp.data.update_chat
  },

  deleteChat: async (options: MutationDelete_ChatArgs) => {
    const resp = await inboxClient.private.mutation(deleteChat, options).toPromise()
    return resp.data.delete_chat
  },

  createMessage: async (options: MutationCreate_MessageArgs) => {
    const resp = await inboxClient.private.mutation(createChatMessage, options).toPromise()
    return resp.data.create_message.message
  },

  updateMessage: async (options: MutationUpdate_MessageArgs) => {
    const resp = await inboxClient.private.mutation(updateChatMessage, options).toPromise()
    return resp.data.update_message.message
  },

  deleteMessage: async (options: MutationDelete_MessageArgs) => {
    const resp = await inboxClient.private.mutation(deleteChatMessage, options).toPromise()
    return resp.data.delete_message
  },

  loadChatMessages: async (options: QueryLoad_Messages_ByArgs) => {
    const resp = await inboxClient.private.query(chatMessagesLoadBy, options).toPromise()
    return resp.data.load_messages_by.messages
  },
}
