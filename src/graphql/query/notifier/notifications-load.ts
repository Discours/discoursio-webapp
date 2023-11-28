import { gql } from '@urql/core'

export default gql`
  query LoadNotificationsQuery($params: NotificationsQueryParams!) {
    load_notifications(params: $params) {
      notifications {
        id
        entity
        action
        paylaod
        created_at
        seen
      }
      unread
      total
    }
  }
`
