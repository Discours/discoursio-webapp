import { gql } from '@urql/core'

export default gql`
  mutation CreateChat($title: String, $members: [String]!) {
    createChat(title: $title, members: $members) {
      error
      chat {
        id
      }
    }
  }
`
