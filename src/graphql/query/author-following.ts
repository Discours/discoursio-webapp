import { gql } from '@urql/core'

export default gql`
  query UserFollowingQuery($slug: String!) {
    userFollowing(slug: $slug) {
      _id: slug
      slug
      name
      bio
      userpic
      communities
      links
      createdAt
      lastSeen
      ratings {
        _id: rater
        rater
        value
      }
    }
  }
`
