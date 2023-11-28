// inbox
import createChat from '../mutation/chat/chat-create'
import deleteChat from '../mutation/chat/chat-delete'
import markAsRead from '../mutation/chat/chat-mark-as-read'
import createChatMessage from '../mutation/chat/chat-message-create'
import deleteChatMessage from '../mutation/chat/chat-message-delete'
import updateChatMessage from '../mutation/chat/chat-message-update'
import updateChat from '../mutation/chat/chat-update'
import { getPrivateClient } from '../privateGraphQLClient'
import chatMessagesLoadBy from '../query/chat/chat-messages-load-by'
import loadRecipients from '../query/chat/chat-recipients'
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
  QueryLoad_RecipientsArgs,
} from '../schema/chat.gen'

const privateInboxGraphQLClient = getPrivateClient('chat')

export const inboxClient = {
  loadChats: async (options: QueryLoad_ChatsArgs): Promise<Chat[]> => {
    const resp = await privateInboxGraphQLClient.query(myChats, options).toPromise()
    return resp.data.load_chats.chats
  },

  createChat: async (options: MutationCreate_ChatArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(createChat, options).toPromise()
    return resp.data.create_chat
  },

  markAsRead: async (options: MutationMark_As_ReadArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(markAsRead, options).toPromise()
    return resp.data.mark_as_read
  },

  updateChat: async (options: MutationUpdate_ChatArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(updateChat, options).toPromise()
    return resp.data.update_chat
  },

  deleteChat: async (options: MutationDelete_ChatArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(deleteChat, options).toPromise()
    return resp.data.delete_chat
  },

  createMessage: async (options: MutationCreate_MessageArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(createChatMessage, options).toPromise()
    return resp.data.create_message.message
  },

  updateMessage: async (options: MutationUpdate_MessageArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(updateChatMessage, options).toPromise()
    return resp.data.update_message.message
  },

  deleteMessage: async (options: MutationDelete_MessageArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(deleteChatMessage, options).toPromise()
    return resp.data.delete_message
  },

  loadChatMessages: async (options: QueryLoad_Messages_ByArgs) => {
    const resp = await privateInboxGraphQLClient.query(chatMessagesLoadBy, options).toPromise()
    return resp.data.load_messages_by.messages
  },
  loadRecipients: async (options: QueryLoad_RecipientsArgs) => {
    const resp = await privateInboxGraphQLClient.query(loadRecipients, options).toPromise()
    return resp.data.load_recipients.members
  },
}
