import { gql } from '@urql/core'

export default gql`
  subscription {
    newShout {
      id
      slug
      title
      subtitle
      body
      topics {
        # id
        title
        slug
      }
      authors {
        id
        name
        slug
        userpic
        caption
      }
    }
  }
`
