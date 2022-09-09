import { gql } from '@urql/core'

export default gql`
  query TopicsByCommunityQuery($community: String!) {
    topicsByCommunity(community: $community) {
      title
      body
      slug
      pic
      parents
      children
      # community
      stat {
        _id: shouts
        shouts
        authors
        # viewed
        followers
      }
    }
  }
`
