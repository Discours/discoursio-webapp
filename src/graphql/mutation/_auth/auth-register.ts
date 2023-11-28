import { gql } from '@urql/core'

export default gql`
  mutation RegisterMutation($email: String!, $password: String!, $name: String!) {
    registerUser(email: $email, password: $password, name: $name) {
      error
    }
  }
`
