import { gql } from '@urql/core'

export default gql`
  query SendLinkQuery($email: String!) {
    sendLink(email: $email) {
      error
    }
  }
`
