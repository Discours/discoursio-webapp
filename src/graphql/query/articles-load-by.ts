import { gql } from '@urql/core'

export default gql`
  query LoadShoutsByQuery($by: ShoutsBy, $limit: Int!, $offset: Int!) {
    loadShoutsBy(by: $by, amount: $limit, offset: $offset) {
      _id: slug
      title
      subtitle
      slug
      layout
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
