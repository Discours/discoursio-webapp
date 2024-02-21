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
          followers
        }
      }
      topics {
        id
        slug
        title
        stat {
          shouts
          followers
        }
      }
      shouts {
        id
        slug
        title
        subtitle
        main_topic
        authors {
          id
          name
          slug
          pic
        }
        stat {
          viewed
          rating
          commented
        }
        created_at
        updated_at
      }
      communities {
        id
        slug
        name
        pic
      }
    }
  }
`
