import { gql } from '@urql/core'

export default gql`
  mutation AuthorRate($rated_slug: String!, $value: Int!) {
    rate_author(rated_slug: $rated_slug, value: $value) {
      error
    }
  }
`
