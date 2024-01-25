import { gql } from '@urql/core'

export default gql`
  query LoadDraftsQuery {
    load_shouts_drafts {
      id
      title
      subtitle
      slug
      layout
      cover
      # community
      media
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
      }
      created_at
      published_at
      stat {
        viewed

        rating
        commented
      }
    }
  }
`
