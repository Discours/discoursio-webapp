import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery($limit: Int, $offset: Int) {
    loadChats(limit: $limit, offset: $offset) {
      error
      chats {
        title
        description
        updatedAt
        messages {
          id
          author
          body
          replyTo
          createdAt
        }
        users {
          slug
          name
          userpic
        }
      }
    }
  }
`
