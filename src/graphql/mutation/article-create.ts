import { gql } from '@urql/core'

export default gql`
  mutation CreateShoutMutation($shout: ShoutInput!) {
    createShout(inp: $shout) {
      error
      shout {
        _id: slug
        slug
        title
        subtitle
        body
      }
    }
  }
`
