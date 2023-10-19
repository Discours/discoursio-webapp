import { gql } from '@urql/core'

export default gql`
  query MySubscriptionsQuery {
    loadMySubscriptions {
      topics {
        id
        title
        body
        slug
      }
      authors {
        id
        name
        slug
        userpic
        createdAt
      }
    }
  }
`
