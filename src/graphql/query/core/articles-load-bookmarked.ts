import { gql } from '@urql/core'

export default gql`
  query LoadBookmarkedShoutsQuery($limit: Int, $offset: Int) {
    load_shouts_bookmarked(limit: $limit, offset: $offset) {
      id
      title
      description
      subtitle
      slug
      layout
      cover
      cover_caption
      main_topic
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
        bio
      }
      created_at
      published_at
      featured_at
      stat {
        viewed
        rating
        commented
      }
    }
  }
`
