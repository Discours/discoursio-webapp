import { gql } from '@urql/core'

export default gql`
  mutation GetSessionMutation {
    getSession {
      error
      token
      user {
        _id: slug
        id
        name
        slug
        bio
        userpic
        links
      }
      news {
        unread
        topics
        authors
        reactions
        # communities
      }
    }
  }
`
