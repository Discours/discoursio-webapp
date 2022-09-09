import { gql } from '@urql/core'

// WARNING: need Auth header

export default gql`
  query ShoutsReactedByUserQuery($slug: String!, $page: Int!, $size: Int!) {
    userReactedShouts(slug: String!, page: Int!, size: Int!) {
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
      }
    }
  }
`
