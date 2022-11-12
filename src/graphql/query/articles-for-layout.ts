import { gql } from '@urql/core'

export default gql`
  query ShoutsForLayoutQuery($amount: Int, $offset: Int, $layout: String) {
    shoutsByLayout(amount: $amount, offset: $offset, layout: $layout) {
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
      }
    }
  }
`
