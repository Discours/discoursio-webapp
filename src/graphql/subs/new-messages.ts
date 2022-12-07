import { gql } from '@urql/core'

export default gql`
  subscription {
    newMessages {
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
