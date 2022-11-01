import { gql } from '@urql/core'

export default gql`
  mutation SendLinkQuery($email: String!, $lang: String) {
    sendLink(email: $email, lang: $lang) {
      error
    }
  }
`
