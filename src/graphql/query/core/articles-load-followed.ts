import { gql } from '@urql/core'

export default gql`
  query ShoutsReactedByUserQuery($slug: String!, $limit: Int!, $offset: Int!) {
    load_shouts_followed(slug: String!, limit: Int, offset: Int) {
      title
      subtitle
      layout
      slug
      cover
      # community
      created_by {
        id
        name
        slug
        pic
        created_at
      }
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
        reacted
        rating
      }
    }
  }
`
