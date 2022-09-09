import { gql } from '@urql/core'

export default gql`
  query ResendQuery($email: String!) {
    resend(email: $email) {
      error
    }
  }
`
