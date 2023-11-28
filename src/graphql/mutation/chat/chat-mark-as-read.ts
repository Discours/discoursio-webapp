import { gql } from '@urql/core'

export default gql`
  mutation MarkAsReadMutation($message_id: Int!, $chat_id: String!) {
    marke_as_read(message_id: $message_id, chat_id: $chat_id) {
      error
    }
  }
`
