import { gql } from '@urql/core'

export default gql`
  query TopicsByCommunityQuery($slug: String, $community_id: Int) {
    get_topics_by_community(slug: $slug, community_id: $community_id) {
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
