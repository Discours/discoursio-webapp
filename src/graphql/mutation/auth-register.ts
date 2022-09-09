import { gql } from '@urql/core'

export default gql`
  mutation RegisterMutation($email: String!, $password: String!) {
    registerUser(email: $email, password: $password) {
      error
      token
      user {
        _id: slug
        name
        slug
        userpic
        bio
        # links
      }
    }
  }
`
