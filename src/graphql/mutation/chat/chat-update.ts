import { gql } from '@urql/core'

export default gql`
  mutation UpdateChat($chat: ChatInput!) {
    update_chat(chat: $chat) {
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
