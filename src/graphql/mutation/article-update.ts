import { gql } from '@urql/core'

export default gql`
  mutation UpdateShoutMutation($shoutId: Int!, $shoutInput: ShoutInput!) {
    updateShout(shoutId: $shoutId, shoutInput: $shoutInput) {
      error
      shout {
        id
        slug
        title
        subtitle
        body
      }
    }
  }
`
