import { gql } from '@urql/core'

// TODO: sync with backend

export default gql`
  mutation DeleteReactionMutation($id: Int!) {
    deleteReaction(id: $id) {
      error
    }
  }
`
