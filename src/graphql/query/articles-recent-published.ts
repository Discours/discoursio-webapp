import { gql } from '@urql/core'

export default gql`
  query RecentPublishedQuery($limit: Int!, $offset: Int!) {
    recentPublished(limit: $limit, offset: $offset) {
      _id: slug
      title
      subtitle
      slug
      layout
      cover
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
      # community
      mainTopic
      publishedAt
      createdAt
      stat {
        _id: viewed
        viewed
        reacted
        rating
      }
    }
  }
`
