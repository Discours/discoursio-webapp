import { gql } from '@urql/core'

export default gql`
  mutation SendLinkQuery($email: String!) {
    sendLink(email: $email) {
      error
    }
  }
`
