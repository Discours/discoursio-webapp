import { gql } from '@urql/core'

export default gql`
  mutation UpdateReactionMutation($id: Int!, $reaction: ReactionInput!) {
    updateReaction(id: $id, reaction: $reaction) {
      error
      reaction {
        id
        body
        updatedAt
        replyTo
      }
    }
  }
`
