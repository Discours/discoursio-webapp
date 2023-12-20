import { gql } from '@urql/core'

export default gql`
  query AuthorsFollowedByQuery($slug: String, $user: String, $author_id: Int) {
    get_author_followed(slug: $slug, user: $user, author_id: $author_id) {
      id
      slug
      name
      pic
      bio
      created_at
      stat {
        shouts
      }
    }
  }
`
