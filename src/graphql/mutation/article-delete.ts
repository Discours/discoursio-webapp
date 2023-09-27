import { gql } from '@urql/core'

export default gql`
  mutation DeleteShoutMutation($shoutId: Int!) {
    deleteShout(shout_id: $shoutId) {
      error
    }
  }
`
