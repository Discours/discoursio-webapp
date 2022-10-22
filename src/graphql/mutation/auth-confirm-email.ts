import { gql } from '@urql/core'

export default gql`
  mutation ConfirmEmailMutation($code: String!) {
    confirmEmail(code: $code) {
      error
      token
      user {
        _id: slug
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
