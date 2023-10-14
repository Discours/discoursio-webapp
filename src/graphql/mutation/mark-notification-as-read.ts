import { gql } from '@urql/core'

export default gql`
  mutation MarkNotificationAsReadMutation($notificationId: Int!) {
    markNotificationAsRead(notification_id: $notificationId) {
      error
    }
  }
`
