import { gql } from '@urql/core'

export default gql`
  query ReactionsForShoutsQuery($shouts: [String]!, $page: Int!, $size: Int!) {
    reactionsForShouts(shouts: $shouts, page: $page, size: $size) {
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
