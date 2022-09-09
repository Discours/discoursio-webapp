import { gql } from '@urql/core'

export default gql`
  mutation IncrementViewMutation($shout: String!) {
    incrementView(shout: $shout) {
      error
    }
  }
`
