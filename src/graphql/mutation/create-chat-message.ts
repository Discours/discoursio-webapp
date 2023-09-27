import { gql } from '@urql/core'

export default gql`
  mutation createMessage($chat: String!, $body: String!, $replyTo: Int) {
    createMessage(chat: $chat, body: $body, replyTo: $replyTo) {
      error
      message {
        id
        body
        author
        createdAt
        replyTo
        updatedAt
      }
    }
  }
`
