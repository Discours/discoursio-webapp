import { gql } from '@urql/core'

export default gql`
  query LoadShoutsSearchQuery($text: String!, $limit: Int, $offset: Int) {
    load_shouts_search(text: $text, limit: $limit, offset: $offset) {
      score
      title
      slug
    }
  }
`
