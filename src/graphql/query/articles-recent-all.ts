import { gql } from '@urql/core'

export default gql`
  query RecentAllQuery($limit: Int!, $offset: Int!) {
    recentAll(limit: $limit, offset: $offset) {
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
