import { gql } from '@urql/core'

export default gql`
  query AuthorsAllQuery {
    authorsAll {
      id
      slug
      name
      bio
      userpic
      createdAt
      stat {
        shouts
        followers
        comments: commented
      }
    }
  }
`