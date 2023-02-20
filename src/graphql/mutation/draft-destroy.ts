import { gql } from '@urql/core'

export default gql`
  mutation DraftDestroyMutation($draft: Int!) {
    deleteDraft(draft: $draft) {
      error
    }
  }
`
