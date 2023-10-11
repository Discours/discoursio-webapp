import { gql } from '@urql/core'

export default gql`
  query GetChatMembersQuery($limit: Int, $offset: Int) {
    loadRecipients(limit: $limit, offset: $offset) {
      members {
        id
        name
        id
        slug
        userpic
        online
      }
      error
    }
  }
`
