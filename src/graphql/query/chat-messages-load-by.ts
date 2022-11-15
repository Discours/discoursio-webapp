import { gql } from '@urql/core'

export default gql`
  query LoadMessagesQuery($by: MessagesBy!, $amount: Int, $offset: Int) {
    loadMessagesBy(by: $by, amount: $amount, offset: $offset) {
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
