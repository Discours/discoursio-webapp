import { gql } from '@urql/core'

export default gql`
  query LoadShoutQuery($slug: String, $shoutId: Int) {
    get_shout(slug: $slug, shout_id: $shoutId) {
      id
      title
      lead
      description
      visibility
      subtitle
      slug
      layout
      cover
      body
      media
      # community
      # mainTopic
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
        pic
        created_at
      }
      createda_at
      published_at
      stat {
        viewed
        reacted
        rating
        commented
      }
    }
  }
`
