import { gql } from '@urql/core'

export default gql`
  mutation createMessage($chat: String!, $body: String!) {
    createMessage(chat: $chat, body: $body) {
      error
      author {
        slug
        id
        chat
      }
    }
  }
`
