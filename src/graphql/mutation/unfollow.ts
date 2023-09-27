import { gql } from '@urql/core'

export default gql`
  mutation UnfollowMutation($what: FollowingEntity!, $slug: String!) {
    unfollow(what: $what, slug: $slug) {
      error
    }
  }
`
