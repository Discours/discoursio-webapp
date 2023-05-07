import { gql } from '@urql/core'

export default gql`
  mutation UpdateShoutMutation($shoutId: Int!, $shoutInput: ShoutInput!) {
    updateShout(shout_id: $shoutId, shout_input: $shoutInput) {
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
