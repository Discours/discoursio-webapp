import { gql } from '@urql/core'

export default gql`
  query LoadShoutsQuery($options: LoadShoutsOptions) {
    loadShouts(options: $options) {
      id
      title
      lead
      description
      subtitle
      slug
      layout
      cover
      lead
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
