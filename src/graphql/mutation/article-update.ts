import { gql } from '@urql/core'

export default gql`
  mutation UpdateShoutMutation($shoutId: Int!, $shoutInput: ShoutInput, $publish: Boolean) {
    updateShout(shout_id: $shoutId, shout_input: $shoutInput, publish: $publish) {
      error
      shout {
        id
        slug
        title
        subtitle
        body
        visibility
      }
    }
  }
`
