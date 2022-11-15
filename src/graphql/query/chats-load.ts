import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery {
    myChats {
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
