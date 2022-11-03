import { gql } from '@urql/core'

export default gql`
  query LoadMessagesQuery($chatId: String!, $offset: Int, $amount: Int) {
    loadChat(chatId: $chatId, offset: $offset, amount: $amount) {
      error
      messages {
        author
        body
        createdAt
        updatedAt
        seen
      }
    }
  }
`
