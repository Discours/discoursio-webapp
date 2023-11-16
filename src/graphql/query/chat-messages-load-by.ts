import { gql } from '@urql/core'

export default gql`
  query LoadMessagesQuery($by: MessagesBy!, $limit: Int, $offset: Int) {
    loadMessagesBy(by: $by, limit: $limit, offset: $offset) {
      error
      messages {
        id
        author
        body
        reply_to
        created_at
        updated_at
      }
    }
  }
`
