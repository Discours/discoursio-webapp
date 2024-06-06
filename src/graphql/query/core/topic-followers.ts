import { gql } from '@urql/core'

export default gql`
  query TopicFollowersQuery($slug: String) {
    get_topic_followers(slug: $slug) {
      id
      slug
      name
      bio
      about
      pic
      # communities
      links
      created_at
      last_seen
      stat {
        shouts
        authors
        followers
        rating
        comments
      }
    }
  }
`
