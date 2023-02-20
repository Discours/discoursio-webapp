import { gql } from '@urql/core'

export default gql`
  query MyFeedQuery($options: LoadShoutsOptions) {
    myFeed(options: $options) {
      _id: slug
      id
      title
      subtitle
      slug
      layout
      cover
      # community
      mainTopic
      topics {
        # id
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
        id
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
