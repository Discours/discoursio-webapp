import { gql } from '@urql/core'

export default gql`
  query LoadDraftsQuery($options: LoadShoutsOptions) {
    loadDrafts(options: $options) {
      id
      title
      subtitle
      slug
      layout
      cover
      # community
      mainTopic
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
        userpic
      }
      createdAt
      publishedAt
    }
  }
`
