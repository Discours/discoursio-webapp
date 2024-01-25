import { gql } from '@urql/core'

export default gql`
  query ShoutsReactedByUserQuery($slug: String!, $limit: Int!, $offset: Int!) {
    load_shouts_followed(slug: String!, limit: Int, offset: Int) {
      title
      subtitle
      layout
      slug
      cover
      # cover_caption
      main_topic
      topics {
        # id
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
      }
      created_at
      published_at
      stat {
        viewed

        rating
      }
    }
  }
`
