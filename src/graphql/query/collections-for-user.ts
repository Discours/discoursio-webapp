import { gql } from '@urql/core'

export default gql`
  query CollectionsUserQuery($slug: String!) {
    getUserCollections(user: $slug) {
      id
      title
      desc
      slug
      amount
    }
  }
`
