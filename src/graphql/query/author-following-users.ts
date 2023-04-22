import { gql } from '@urql/core'

export default gql`
  query UserFollowingUsersQuery($slug: String!) {
    userFollowedAuthors(slug: $slug) {
      id
      slug
      name
      userpic
    }
  }
`
