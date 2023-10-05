import { gql } from '@urql/core'

export default gql`
  query LoadReactions($by: ReactionBy!, $limit: Int, $offset: Int) {
    loadReactionsBy(by: $by, limit: $limit, offset: $offset) {
      id
      kind
      body
      range
      replyTo
      shout {
        id
        slug
        title
      }
      createdBy {
        name
        slug
        userpic
        createdAt
      }
      createdAt
      updatedAt
      stat {
        rating
      }
    }
  }
`
