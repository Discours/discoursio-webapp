import { gql } from '@urql/core'

export default gql`
  query LoadReactionsByQuery($by: ReactionsBy, $limit: Int!, $offset: Int!) {
    loadReactionsBy(by: $by, amount: $limit, offset: $offset) {
      id
      createdBy {
        slug
        name
        userpic
      }
      body
      kind
      createdAt
      updatedAt
      shout {
        slug
        title
      }
      replyTo {
        id
        createdBy {
          slug
          userpic
          name
        }
        body
        kind
      }
    }
  }
`
