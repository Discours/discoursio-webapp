import { gql } from '@urql/core'

export default gql`
  mutation DeleteShoutMutation($shoutId: Int!) {
    delete_shout(shout_id: $shoutId) {
      error
    }
  }
`
