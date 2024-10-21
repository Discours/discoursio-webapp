import { gql } from '@urql/core'

export default gql`
  mutation CollabInviteCreateMutation($author_id: Int!, $slug: String!) {
    create_invite(author_id: $author_id, slug: $slug) {
      error
    }
  }
`
