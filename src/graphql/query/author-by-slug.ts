import { gql } from '@urql/core'

export default gql`
  query GetAuthorBySlugQuery($slug: String!) {
    getAuthor(slug: $slug) {
      _id: slug
      slug
      name
      bio
      userpic
      communities
      links
      createdAt
      lastSeen
      # ratings {
      #  _id: rater
      #  rater
      #  value
      # }
    }
  }
`
