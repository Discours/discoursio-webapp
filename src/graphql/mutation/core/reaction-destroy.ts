import { gql } from '@urql/core'

export default gql`
  mutation DeleteReactionMutation($reaction: Int!) {
    delete_reaction(reaction_id: $reaction) {
      error
      reaction {
        id
      }
    }
  }
`
