import { gql } from '@urql/core'

export default gql`
  query LoadMessagesQuery($by: MessagesBy!, $limit: Int, $offset: Int) {
    loadMessagesBy(by: $by, limit: $limit, offset: $offset) {
      error
      messages {
        author
        body
        replyTo
        created_at
        id
        updated_at
        replyTo
      }
    }
  }
`
