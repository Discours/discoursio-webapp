import { gql } from '@urql/core'

export default gql`
  query ChatUsersAllQuery {
    chatUsersAll {
      slug
      name
      userpic
      lastSeen
    }
  }
`
