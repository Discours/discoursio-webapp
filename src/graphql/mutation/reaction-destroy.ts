import { gql } from '@urql/core'


export default gql`
  mutation DeleteReactionMutation($id: Int!) {
    deleteReaction(id: $id) {
      error
    }
  }
`
