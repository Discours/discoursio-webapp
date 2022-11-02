import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery {
    myChats {
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
      title
      createdAt
    }
  }
`
