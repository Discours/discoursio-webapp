import { gql } from '@urql/core'

export default gql`
  mutation CreateShoutMutation($shout: ShoutInput!) {
    create_shout(inp: $shout) {
      error
      shout {
        id
        slug
        title
        subtitle
        body
      }
    }
  }
`
