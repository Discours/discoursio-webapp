import { gql } from '@urql/core'

export default gql`
  query LoadMessagesQuery($by: MessagesBy!, $limit: Int, $offset: Int) {
    loadMessagesBy(by: $by, limit: $limit, offset: $offset) {
      error
      messages {
        author
        body
        replyTo
        createdAt
        id
        updatedAt
      }
    }
  }
`
