import { gql } from '@urql/core'

export default gql`
  mutation GetSessionMutation {
    getSession {
      error
      token
      user {
        id
        name
        slug
        bio
        userpic
        links
      }
    }
  }
`
