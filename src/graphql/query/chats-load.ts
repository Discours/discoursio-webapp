import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery($limit: Int, $offset: Int) {
    loadChats(limit: $limit, offset: $offset) {
      error
      chats {
        id
        messages {
          id
          body
          author
        }
        admins {
          slug
          name
        }
        users {
          slug
          name
        }
        unread
        description
        updatedAt
      }
    }
  }
`
