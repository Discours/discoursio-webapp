import { gql } from '@urql/core'
export default gql`
  mutation UnfollowMutation($what: FollowingEntity!, $slug: String!) {
    unfollow(what: $what, slug: $slug) {
      error
      authors {
        id
        name
        slug
        pic
        bio
        stat {
          followers
          shouts
          comments
        }
      }
      topics {
        body
        slug
        stat {
          shouts
          authors
          followers
        }
      }
    }
  }
`
