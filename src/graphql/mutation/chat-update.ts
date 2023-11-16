import { ChatInput } from './../types.gen'
import { gql } from '@urql/core'

export default gql`
  mutation UpdateChat($chat: ChatInput!) {
    updateChat(chat: $chat) {
      error
      chat {
        id
        members {
          id
          slug
        }
      }
    }
  }
`
