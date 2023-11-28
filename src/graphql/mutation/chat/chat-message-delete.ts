import { gql } from '@urql/core'

export default gql`
  mutation DeleteMessage($chat_id: String!) {
    delete_message(chat_id: $chat_id) {
      error
    }
  }
`
