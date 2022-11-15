import { gql } from '@urql/core'

export default gql`
  query TopicBySlugQuery($slug: String!) {
    getTopic(slug: $slug) {
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
