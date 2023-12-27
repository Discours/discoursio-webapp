import { gql } from '@urql/core'

export default gql`
  query GetAuthorId($user: String!) {
    get_author_id(user: $user) {
      id
      slug
      name
      bio
      about
      pic
      links
      created_at
      last_seen
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
