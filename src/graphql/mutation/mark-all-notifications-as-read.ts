import { gql } from '@urql/core'

export default gql`
  mutation MarkAllNotificationsAsReadMutation {
    markAllNotificationsAsRead {
      error
    }
  }
`
