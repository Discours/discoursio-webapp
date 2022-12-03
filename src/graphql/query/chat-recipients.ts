import { gql } from '@urql/core'

export default gql`
  query GetChatsQuery($limit: Int, $offset: Int) {
    loadRecipients(limit: $limit, offset: $offset) {
      members {
        name
        id
        slug
        userpic
      }
      error
    }
  }
`
