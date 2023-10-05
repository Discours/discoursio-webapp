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
      # communities
      links
      createdAt
      lastSeen
      stat {
        shouts
        followers
        followings
        rating
        commented
      }
    }
  }
`
