import { gql } from '@urql/core'

export default gql`
  query LoadSearchQuery($options: LoadShoutsOptions) {
    load_shouts_search(options: $options) {
      score
      title
      slug
    }
  }
`
