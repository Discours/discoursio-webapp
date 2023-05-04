import { gql } from '@urql/core'

export default gql`
  query AuthorLoadByQuery($by: AuthorsBy, $limit: Int, $offset: Int) {
    loadAuthorsBy(by: $by, limit: $limit, offset: $offset) {
      id
      slug
      name
      bio
      userpic
      # communities
      links
      # createdAt
      lastSeen
      # ratings {
      #  rater
      #  value
      # }
    }
  }
`
