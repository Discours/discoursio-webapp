import { gql } from '@urql/core'

export default gql`
  query AuthorsLoadByQuery($by: AuthorsBy!, $limit: Int!, $offset: Int!) {
    load_authors_by(by: $by, limit: $limit, offset: $offset) {
      id
      slug
      name
      bio
      pic
      created_at
      stat {
        shouts
        comments: commented
        followers
        followings
        rating
        rating_shouts
        rating_comments
      }
    }
  }
`
