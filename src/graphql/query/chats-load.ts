import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery($limit: Int, $offset: Int) {
    loadChats(limit: $limit, offset: $offset) {
      error
      chats {
        id
        admins
        users
        unread
        description
        updatedAt
        messages {
          id
          body
          author
        }
      }
    }
  }
`
