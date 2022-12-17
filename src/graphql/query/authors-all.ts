import { gql } from '@urql/core'

export default gql`
  query AuthorsAllQuery {
    authorsAll {
      _id: slug
      id
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
