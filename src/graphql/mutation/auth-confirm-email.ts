import { gql } from '@urql/core'

export default gql`
  mutation ConfirmEmailMutation($token: String!) {
    confirmEmail(token: $token) {
      error
      token
      user {
        id
        email
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
        communities
      }
    }
  }
`
