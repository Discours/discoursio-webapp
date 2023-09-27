import { gql } from '@urql/core'

export default gql`
  mutation FollowMutation($what: FollowingEntity!, $slug: String!) {
    follow(what: $what, slug: $slug) {
      error
    }
  }
`
