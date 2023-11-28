import { gql } from '@urql/core'

export default gql`
  query AuthorsAllQuery {
    get_authors_all {
      id
      slug
      name
      bio
      pic
      created_at
      stat {
        shouts
        followers
        comments: commented
      }
    }
  }
`
