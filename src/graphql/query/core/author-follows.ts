import { gql } from '@urql/core'

export default gql`
  query GetAuthorFollows($slug: String, $user: String, $author_id: Int) {
    get_author_follows(slug: $slug, user: $user, author_id: $author_id) {
      authors {
        id
        slug
        name
        pic
        bio
        stat {
          shouts
          authors
          followers
        }
      }
      topics {
        id
        slug
        title
        stat {
          shouts
          authors
          followers
        }
      }
      #communities {
      #  id
      #  slug
      #  name
      #  pic
      #}
    }
  }
`
