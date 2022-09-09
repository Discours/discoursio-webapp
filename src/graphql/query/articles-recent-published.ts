import { gql } from '@urql/core'

export default gql`
  query RecentPublishedQuery($page: Int!, $size: Int!) {
    recentPublished(page: $page, size: $size) {
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
