import { gql } from '@urql/core'

export default gql`
  query AuthorsAllQuery($limit: Int, $offset: Int) {
    load_authors_all(limit: $limit, offset: $offset) {
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
