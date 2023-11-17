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
          id
          slug
          name
          userpic
        }
        unread
        description
        updated_at
        messages {
          id
          body
          author
        }
      }
    }
  }
`
