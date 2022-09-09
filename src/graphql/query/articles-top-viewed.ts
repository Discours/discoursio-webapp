import { gql } from '@urql/core'

export default gql`
  query TopViewedShoutsQuery($page: Int!, $size: Int!) {
    topViewed(page: $page, size: $size) {
      _id: slug
      title
      subtitle
      slug
      layout
      cover
      # community
      mainTopic
      topics {
        title
        body
        slug
        stat {
          _id: shouts
          shouts
          authors
          followers
        }
      }
      authors {
        _id: slug
        name
        slug
        userpic
      }
      createdAt
      publishedAt
      stat {
        _id: viewed
        viewed
        reacted
        rating
      }
    }
  }
`
