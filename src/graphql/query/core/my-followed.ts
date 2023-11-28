import { gql } from '@urql/core'

export default gql`
  query MySubscriptionsQuery {
    get_my_followed {
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
        pic
        created_at
      }
      communitites {
        id
        name
        slug
        pic
        created_at
      }
    }
  }
`
