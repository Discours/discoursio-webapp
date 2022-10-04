import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery {
    myChats {
      messages {
        chatId
        id
        author
        body
        replyTo
        createdAt
      }
      users {
        slug
        name
        pic
      }
      title
      createdAt
    }
  }
`
