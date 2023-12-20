import { gql } from '@urql/core'

export default gql`
  query LoadRandomTopShoutsQuery($params: LoadRandomTopShoutsParams) {
    load_shouts_random_top(params: $params) {
      id
      title
      # lead
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
      stat {
        viewed
        reacted
        rating
        commented
      }
    }
  }
`
