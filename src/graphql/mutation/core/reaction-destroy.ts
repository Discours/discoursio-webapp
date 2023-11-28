import { gql } from '@urql/core'

export default gql`
  mutation DeleteReactionMutation($id: Int!) {
    delete_reaction(id: $id) {
      error
      reaction {
        id
      }
    }
  }
`
