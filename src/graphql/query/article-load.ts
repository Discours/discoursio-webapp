import { gql } from '@urql/core'

export default gql`
  query LoadShoutQuery($slug: String, $shoutId: Int) {
    loadShout(slug: $slug, shout_id: $shoutId) {
      id
      title
      subtitle
      slug
      layout
      cover
      body
      media
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
