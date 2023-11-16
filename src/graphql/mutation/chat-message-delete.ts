import { gql } from '@urql/core'

export default gql`
  mutation DeleteMessage($chat_id: String!) {
    deleteMessage(chat_id: $chat_id) {
      error
    }
  }
`
