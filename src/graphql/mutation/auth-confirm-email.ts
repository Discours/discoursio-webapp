import { gql } from '@urql/core'

export default gql`
  query ConfirmEmailQuery($code: String!) {
    confirmEmail(code: $code) {
      error
    }
  }
`
