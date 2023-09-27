import { gql } from '@urql/core'

export default gql`
  query UserFollowingTopicsQuery($slug: String!) {
    userFollowedTopics(slug: $slug) {
      id
      slug
      title
      body
      pic
      # community
      stat {
        shouts
        followers
        authors
      }
    }
  }
`
