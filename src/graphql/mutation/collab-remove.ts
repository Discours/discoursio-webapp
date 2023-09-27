import { gql } from '@urql/core'

export default gql`
  mutation CollabRemoveeMutation($author: String!, $slug: String!) {
    removeAuthor(author: $author, shout: $slug) {
      error
    }
  }
`
