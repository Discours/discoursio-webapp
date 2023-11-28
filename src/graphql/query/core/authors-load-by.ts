import { gql } from '@urql/core'

export default gql`
  query AuthorLoadByQuery($by: AuthorsBy, $limit: Int, $offset: Int) {
    load_authors_by(by: $by, limit: $limit, offset: $offset) {
      id
      slug
      name
      bio
      userpic
      # communities
      links
      created_at
      last_seen
      # ratings {
      #  rater
      #  value
      # }
    }
  }
`
