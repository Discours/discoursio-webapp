import { gql } from '@urql/core'

export default gql`
  query LoadNotificationsQuery {
    loadNotifications(params: { limit: 10, offset: 0 }) {
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
