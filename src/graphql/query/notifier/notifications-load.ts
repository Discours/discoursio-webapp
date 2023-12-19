import { gql } from '@urql/core'

export default gql`
  query LoadNotificationsQuery($after: Int!, $limit: Int, $offset: Int) {
    load_notifications(after: $after, limit: $limit, offset: $offset) {
      notifications {
        id
        entity
        action
        payload
        created_at
        seen
      }
      unread
      total
    }
  }
`
