import { gql } from '@urql/core'

export default gql`
  query LoadReactions($by: ReactionBy!, $limit: Int, $offset: Int) {
    loadReactionsBy(by: $by, limit: $limit, offset: $offset) {
      id
      shout {
        title
      }
      body
      createdAt
      createdBy {
        name
      }
      updatedAt
    }
  }
`
