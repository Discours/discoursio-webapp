import { gql } from '@urql/core'

export default gql`
  query UserSubscribersQuery($slug: String!) {
    userFollowers(slug: $slug) {
      id
      slug
      name
      userpic
      bio
      createdAt
      stat {
        shouts
      }
    }
  }
`
