import { ChatInput } from './../types.gen'
import { gql } from '@urql/core'

export default gql`
  mutation DeleteChat($chat_id: String!) {
    deleteChat(chat_id: $chat_id) {
      error
    }
  }
`
