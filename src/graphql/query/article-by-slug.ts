import { gql } from '@urql/core'

export default gql`
  query GetShoutBySlugQuery($slug: String!) {
    getShoutBySlug(slug: $slug) {
      _id: slug
      slug
      title
      subtitle
      layout
      cover
      # community
      body
      authors {
        _id: slug
        name
        slug
        userpic
        caption
      }
      mainTopic
      topics {
        title
        body
        slug
        stat {
          _id: shouts
          shouts
          authors
          followers
        }
      }
      createdAt
      updatedAt
      publishedAt
      stat {
        _id: viewed
        viewed
        reacted
        rating
        commented
      }
    }
  }
`
