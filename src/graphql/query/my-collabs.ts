import { gql } from '@urql/core'

export default gql`
  query GetCollabsQuery {
    getCollabs {
      authors {
        id
        slug
        name
        pic
      }
      createdAt
      body
      title
    }
  }
`
