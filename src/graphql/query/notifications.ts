import { gql } from '@urql/core'

export default gql`
  query LoadNotificationsQuery($params: NotificationsQueryParams!) {
    loadNotifications(params: $params) {
      notifications {
        id
        shout
        reaction
        type
        createdAt
        seen
        data
        occurrences
      }
      totalCount
      totalUnreadCount
    }
  }
`
