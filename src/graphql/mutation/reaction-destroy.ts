import { gql } from '@urql/core'

export default gql`
  mutation DeleteReactionMutation($reaction: Int!) {
    deleteReaction(reaction: $reaction) {
      error
      reaction {
        id
      }
    }
  }
`
