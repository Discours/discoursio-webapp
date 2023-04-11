import { gql } from '@urql/core'

export default gql`
  subscription {
    newReactions {
      id
      body
      kind
      range
      createdAt
      replyTo
      stat {
        rating
      }
      shout {
        id
        slug
      }
      createdBy {
        name
        slug
        userpic
      }
    }
  }
`
