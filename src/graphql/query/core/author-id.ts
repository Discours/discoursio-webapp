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
    }
  }
`
