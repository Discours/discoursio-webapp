import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery($limit: Int, $offset: Int) {
    loadChats(limit: $limit, offset: $offset) {
      error
      chats {
        id
        title
        admins
        users
        members {
          id
          slug
          name
          userpic
        }
        unread
        description
        updatedAt
        private
        messages {
          id
          body
          author
        }
      }
    }
  }
`
