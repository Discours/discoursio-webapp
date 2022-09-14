import { gql } from '@urql/core'

export default gql`
  query ShoutsBySessionQuery($limit: Int!, $offset: Int!) {
    shoutsForFeed(limit: $limit, offset: $offset) {
      _id: slug
      title
      subtitle
      layout
      slug
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
        commented
      }
    }
  }
`
