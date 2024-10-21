import { gql } from '@urql/core'

export default gql`
  mutation DeleteMessage($chat_id: String!, $message_id: Int!) {
    delete_message(chat_id: $chat_id, message_id: $message_id) {
      error
    }
  }
`
