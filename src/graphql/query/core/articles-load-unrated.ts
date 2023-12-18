import { gql } from '@urql/core'

export default gql`
  query LoadUnratedShoutsQuery($limit: Int!) {
    loadUnratedShouts(limit: $limit) {
      id
      title
      # lead
      description
      subtitle
      slug
      layout
      cover
      cover_caption
      # community
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
      stat {
        viewed
        reacted
        rating
        commented
      }
    }
  }
`
