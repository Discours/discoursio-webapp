import { gql } from '@urql/core'

export default gql`
  mutation DraftUpdateMutation($draft: DraftInput!) {
    updateDraft(draft: $draft) {
      error
      draft {
        id
        slug
        title
        subtitle
        body
        topics {
          # id
          title
          slug
        }
        authors {
          id
          name
          slug
          userpic
          caption
        }
      }
    }
  }
`
