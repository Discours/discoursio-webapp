import { gql } from '@urql/core'

export default gql`
  query isEmailUsedQuery($email: String!) {
    isEmailUsed(email: $email)
  }
`
