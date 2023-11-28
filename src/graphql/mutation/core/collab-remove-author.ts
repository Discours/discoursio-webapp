import { gql } from '@urql/core'

export default gql`
  mutation CollabRemoveeMutation($author_id: Int!, $slug: String!) {
    remove_author(author_id: $author_id, slug: $slug) {
      error
    }
  }
`
