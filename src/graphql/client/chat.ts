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
  QueryLoadChatsArgs,
  QueryLoadMessagesByArgs,
  MutationCreateChatArgs,
  MutationCreateMessageArgs,
  QueryLoadRecipientsArgs,
  Chat,
  MutationMarkAsReadArgs,
  MutationDeleteChatArgs,
  MutationUpdateChatArgs,
  MutationUpdateMessageArgs,
  MutationDeleteMessageArgs,
} from '../schema/chat.gen'

const privateInboxGraphQLClient = getPrivateClient('chat')

export const inboxClient = {
  loadChats: async (options: QueryLoadChatsArgs): Promise<Chat[]> => {
    const resp = await privateInboxGraphQLClient.query(myChats, options).toPromise()
    return resp.data.load_chats.chats
  },

  createChat: async (options: MutationCreateChatArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(createChat, options).toPromise()
    return resp.data.create_chat
  },

  markAsRead: async (options: MutationMarkAsReadArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(markAsRead, options).toPromise()
    return resp.data.mark_as_read
  },

  updateChat: async (options: MutationUpdateChatArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(updateChat, options).toPromise()
    return resp.data.update_chat
  },

  deleteChat: async (options: MutationDeleteChatArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(deleteChat, options).toPromise()
    return resp.data.delete_chat
  },

  createMessage: async (options: MutationCreateMessageArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(createChatMessage, options).toPromise()
    return resp.data.create_message.message
  },

  updateMessage: async (options: MutationUpdateMessageArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(updateChatMessage, options).toPromise()
    return resp.data.update_message.message
  },

  deleteMessage: async (options: MutationDeleteMessageArgs) => {
    const resp = await privateInboxGraphQLClient.mutation(deleteChatMessage, options).toPromise()
    return resp.data.delete_message
  },

  loadChatMessages: async (options: QueryLoadMessagesByArgs) => {
    const resp = await privateInboxGraphQLClient.query(chatMessagesLoadBy, options).toPromise()
    return resp.data.load_messages_by.messages
  },
  loadRecipients: async (options: QueryLoadRecipientsArgs) => {
    const resp = await privateInboxGraphQLClient.query(loadRecipients, options).toPromise()
    return resp.data.load_recipients.members
  },
}
