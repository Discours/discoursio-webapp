import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery($limit: Int, $offset: Int) {
    loadChats(limit: $limit, offset: $offset) {
      error
      chats {
        id
        title
        admins
        members {
          slug
          name
          userpic
        }
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
