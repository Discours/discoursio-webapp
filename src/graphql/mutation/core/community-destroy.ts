import { gql } from '@urql/core'

export default gql`
  mutation CommunityDestroyMutation($slug: String!) {
    delete_community(slug: $slug) {
      error
    }
  }
`
