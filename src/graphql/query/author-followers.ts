import { gql } from '@urql/core'

export default gql`
  query UserSubscribersQuery($slug: String!) {
    userSubcribers(slug: $slug) {
      _id: slug
      id
      slug
      name
      bio
      userpic
      communities
      links
      createdAt
      lastSeen
      ratings {
        _id: rater
        rater
        value
      }
    }
  }
`
