import { gql } from '@urql/core'

export default gql`
  query LoadDraftsQuery {
    loadDrafts {
      id
      title
      subtitle
      slug
      layout
      cover
      # community
      mainTopic
      media
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
