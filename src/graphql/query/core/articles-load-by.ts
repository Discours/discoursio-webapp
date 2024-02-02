import { gql } from '@urql/core'

export default gql`
  query LoadShoutsQuery($options: LoadShoutsOptions) {
    load_shouts_by(options: $options) {
      id
      title
      lead
      description
      subtitle
      slug
      layout
      cover
      lead
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
