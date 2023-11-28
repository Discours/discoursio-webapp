import { gql } from '@urql/core'

export default gql`
  mutation MarkAllNotificationsAsReadMutation {
    mark_all_notifications_as_read {
      error
    }
  }
`
