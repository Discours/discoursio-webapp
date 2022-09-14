import { gql } from '@urql/core'

export default gql`
  query ReactionsForShoutsQuery($shouts: [String]!, $limit: Int!, $offset: Int!) {
    reactionsForShouts(shouts: $shouts, limit: $limit, offset: $offset) {
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
