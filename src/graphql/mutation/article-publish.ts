import { gql } from '@urql/core'

export default gql`
  mutation PublishShoutMutation($shoutId: Int!, $shoutInput: ShoutInput) {
    publishShout(shout_id: $shoutId, shout_input: $shoutInput) {
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
