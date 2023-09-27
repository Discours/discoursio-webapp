import { gql } from '@urql/core'

export default gql`
  query TopicsByCommunityQuery($community: String!) {
    topicsByCommunity(community: $community) {
      title
      body
      slug
      pic
      # community
      stat {
        shouts
        authors
        followers
      }
    }
  }
`
