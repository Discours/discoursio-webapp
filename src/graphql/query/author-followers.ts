import { gql } from '@urql/core'

export default gql`
  query UserSubscribersQuery($slug: String!) {
    userFollowers(slug: $slug) {
      _id: slug
      id
      slug
      name
      userpic
    }
  }
`
