import { gql } from '@urql/core'

export default gql`
  query {
    get_authors_all {
      id
      slug
      name
      bio
      pic
      created_at
    }
  }
`
