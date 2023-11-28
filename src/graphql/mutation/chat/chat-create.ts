import { gql } from '@urql/core'

export default gql`
  mutation CreateChat($title: String, $members: [Int]!) {
    create_chat(title: $title, members: $members) {
      error
      chat {
        id
        members {
          id
          slug
        }
      }
    }
  }
`
