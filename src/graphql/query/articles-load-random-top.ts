import { gql } from '@urql/core'

export default gql`
  query LoadRandomTopShoutsQuery($params: LoadRandomTopShoutsParams) {
    loadRandomTopShouts(params: $params) {
      id
      title
      lead
      description
      subtitle
      slug
      layout
      cover
      lead
      # community
      mainTopic
      topics {
        id
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
        createdAt
        bio
      }
      createdAt
      publishedAt
      stat {
        viewed
        reacted
        rating
        commented
      }
    }
  }
`