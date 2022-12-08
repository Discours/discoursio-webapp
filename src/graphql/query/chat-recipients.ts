import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery($limit: Int, $offset: Int) {
    loadRecipients(limit: $limit, offset: $offset) {
      members {
        id
        name
        id
        slug
        userpic
      }
      error
    }
  }
`
