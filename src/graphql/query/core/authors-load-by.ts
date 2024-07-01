import { gql } from '@urql/core'

export default gql`
  query AuthorsAllQuery($by: AuthorsBy!, $limit: Int, $offset: Int) {
    get_authors_nostat(by: $by, limit: $limit, offset: $offset) {
      id
      slug
      name
      bio
      pic
      created_at
      stat {
        shouts
        authors
        followers
        rating
        comments
        rating_shouts
        rating_comments
      }
    }
  }
`
