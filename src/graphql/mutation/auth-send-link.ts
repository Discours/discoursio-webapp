import { gql } from '@urql/core'

export default gql`
  mutation SendLinkQuery($email: String!, $lang: String, $template: String) {
    sendLink(email: $email, lang: $lang, template: $template) {
      error
    }
  }
`
