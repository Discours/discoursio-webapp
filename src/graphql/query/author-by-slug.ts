import { gql } from '@urql/core'

export default gql`
  query GetAuthorBySlugQuery($slug: String!) {
    getAuthor(slug: $slug) {
      id
      slug
      name
      bio
      about
      userpic
      communities
      links
      createdAt
      lastSeen
      # ratings {
      #  rater
      #  value
      # }
    }
  }
`
