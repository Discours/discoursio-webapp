import { gql } from '@urql/core'

export default gql`
  query GetChatMembersQuery($limit: Int, $offset: Int) {
    load_recipients(limit: $limit, offset: $offset) {
      members {
        id
        name
        id
        slug
        pic
        online
      }
      error
    }
  }
`
