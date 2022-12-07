import { gql } from '@urql/core'

export default gql`
  subscription {
    newMessage {
      id
      chatId
      author
      body
      replyTo
      createdAt
      updatedAt
    }
  }
`
