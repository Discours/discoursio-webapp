import { gql } from '@urql/core'

export default gql`
  mutation MarkNotificationAsReadMutation($notificationId: Int!) {
    mark_seen(notification_id: $notificationId) {
      error
    }
  }
`
