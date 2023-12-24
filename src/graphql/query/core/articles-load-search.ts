import { gql } from '@urql/core'

export default gql`
  query LoadSearchQuery($params: LoadShoutsOptions) {
    load_shouts_search(params: $params) {
      score
      title
      slug
    }
  }
`
