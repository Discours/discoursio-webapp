import { gql } from '@urql/core'

export default gql`
  query LoadShoutQuery($slug: String, $shout_id: Int) {
    get_shout(slug: $slug, shout_id: $shout_id) {
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
      created_at
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
