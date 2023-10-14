import { gql } from '@urql/core'

export default gql`
  query SignInQuery($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      error
      token
      user {
        id
        name
        slug
        userpic
      }
    }
  }
`
