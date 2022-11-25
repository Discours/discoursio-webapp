import { gql } from '@urql/core'

export default gql`
  query AuthorsAllQuery {
    authorsAll {
      _id: slug
      slug
      name
      bio
      userpic
      stat {
        shouts
        followers
        comments: commented
      }
    }
  }
`
