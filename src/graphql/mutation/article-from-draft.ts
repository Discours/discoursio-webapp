import { gql } from '@urql/core'

export default gql`
  mutation ShoutFromDraftMutation($draft: Int!) {
    draftToShout(draft: $draft) {
      error
      shout {
        _id: slug
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
