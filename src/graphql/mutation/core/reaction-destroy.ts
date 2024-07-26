import { gql } from '@urql/core'

export default gql`
  mutation DeleteReactionMutation($reaction_id: Int!) {
    delete_reaction(reaction_id: $reaction_id) {
      error
      reaction {
        id
      }
    }
  }
`
