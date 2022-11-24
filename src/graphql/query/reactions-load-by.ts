import { gql } from '@urql/core'

export default gql`
  query LoadReactions($by: ReactionBy!, $limit: Int, $offset: Int) {
    loadReactionsBy(by: $by, limit: $limit, offset: $offset) {
      id
      body
      range
      replyTo {
        id
        # kind
      }
      createdBy {
        name
        slug
        userpic
      }
      createdAt
      updatedAt
    }
  }
`
