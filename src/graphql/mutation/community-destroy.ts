import { gql } from '@urql/core'

export default gql`
  mutation CommunityDestroyMutation($slug: String!) {
    deleteCommunity(slug: $slug) {
      error
    }
  }
`
