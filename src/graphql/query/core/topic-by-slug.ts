import { gql } from '@urql/core'

export default gql`
  query TopicBySlugQuery($slug: String!) {
    get_topic(slug: $slug) {
      title
      body
      slug
      pic
      # community
      stat {
        shouts
        authors
        # viewed
        followers
      }
    }
  }
`
