import { gql } from '@urql/core'

export default gql`
  query TopicBySlugQuery($slug: String!) {
    getTopic(slug: $slug) {
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
