import { gql } from '@urql/core'

export default gql`
  query ForgetQuery($email: String!) {
    forget(email: $email) {
      error
    }
  }
`
