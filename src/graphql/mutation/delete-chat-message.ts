import { gql } from '@urql/core'

export default gql`
  mutation deleteMessage($chatId: String!, $id: Int!) {
    deleteMessage(chatId: $chatId, id: $id) {
      error
      messages {
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
