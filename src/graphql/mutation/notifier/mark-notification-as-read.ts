import { gql } from '@urql/core'

export default gql`
  mutation MarkNotificationAsReadMutation($notificationId: Int!) {
    mark_notification_as_read(notification_id: $notificationId) {
      error
    }
  }
`
