import { gql } from '@urql/core'

export default gql`
  mutation UpdateReactionMutation($reaction: ReactionInput!) {
    update_reaction(reaction: $reaction) {
      error
      reaction {
        id
        body
        updated_at
        reply_to
      }
    }
  }
`
