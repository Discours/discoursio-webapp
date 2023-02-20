import { gql } from '@urql/core'

export default gql`
  query MyDraftsQuery {
    loadDrafts {
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
