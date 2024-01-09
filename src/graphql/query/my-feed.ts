import { gql } from '@urql/core'

export default gql`
  query MyFeedQuery($options: LoadShoutsOptions) {
    myFeed(options: $options) {
      id
      title
      subtitle
      slug
      layout
      cover
      # community
      mainTopic
      topics {
        id
        title
        body
        slug
      }
      authors {
        id
        name
        slug
        userpic
        createdAt
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