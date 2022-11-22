import { gql } from '@urql/core'

export default gql`
  query LoadShoutQuery($slug: String!) {
    loadShout(slug: $slug) {
      _id: slug
      title
      subtitle
      slug
      layout
      cover
      body
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
        # _id: viewed
        # viewed
        reacted
        rating
      }
    }
  }
`
