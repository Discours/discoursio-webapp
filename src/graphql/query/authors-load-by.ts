import { gql } from '@urql/core'

export default gql`
  query AuthorLoadByQuery($by: AuthorsBy, $limit: Int, $offset: Int) {
    loadAuthorsBy(by: $by, limit: $limit, offset: $offset) {
      _id: slug
      slug
      name
      bio
      userpic
      # communities
      links
      # createdAt
      lastSeen
      # ratings {
      #  _id: rater
      #  rater
      #  value
      # }
    }
  }
`
