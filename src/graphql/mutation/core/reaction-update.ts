import { gql } from '@urql/core'

export default gql`
  mutation UpdateReactionMutation($id: Int!, $reaction: ReactionInput!) {
    update_reaction(id: $id, reaction: $reaction) {
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
