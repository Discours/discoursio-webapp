import { gql } from '@urql/core'

export default gql`
  mutation CollabInviteMutation($author: String!, $slug: String!) {
    inviteAuthor(author: $author, shout: $slug) {
      error
    }
  }
`
