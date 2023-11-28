import { gql } from '@urql/core'

export default gql`
  query TopicsByCommunityQuery($community: String!) {
    get_topics_by_community(community: $community) {
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
