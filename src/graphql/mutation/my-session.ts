import { gql } from '@urql/core'

export default gql`
  query RefreshSessionQuery {
    refreshSession {
      error
      token
      user {
        _id: slug
        name
        slug
        bio
        userpic
        links
      }
      info {
        inbox
        topics
        authors
        communities
      }
    }
  }
`
