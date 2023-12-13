import { gql } from '@urql/core'

export default gql`
  query LoadNotificationsQuery($limit: Int, $offset: Int) {
    load_notifications(limit: $limit, offset: $offset) {
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
