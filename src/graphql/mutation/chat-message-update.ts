import { ChatInput } from './../types.gen'
import { gql } from '@urql/core'

export default gql`
  mutation UpdateMessage($message: MessageInput!) {
    createMessage(message: $message) {
      error
      message {
        id
        body
        author
        created_at
        reply_to
        updated_at
      }
    }
  }
`
