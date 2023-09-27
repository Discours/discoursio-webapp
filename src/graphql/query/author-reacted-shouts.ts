import { gql } from '@urql/core'

// WARNING: need Auth header

export default gql`
  query ShoutsReactedByUserQuery($slug: String!, $limit: Int!, $offset: Int!) {
    userReactedShouts(slug: String!, page: Int!, size: Int!) {
      title
      subtitle
      layout
      slug
      cover
      # community
      mainTopic
      topics {
        # id
        title
        body
        slug
        stat {
          shouts
          authors
          followers
        }
      }
      authors {
        id
        name
        slug
        userpic
      }
      createdAt
      publishedAt
      stat {
        viewed
        reacted
        rating
      }
    }
  }
`
