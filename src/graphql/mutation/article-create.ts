import { gql } from '@urql/core'

export default gql`
  mutation CreateShoutMutation($shout: ShoutInput!) {
    createShout(inp: $shout) {
      error
      shout {
        id
        slug
        title
        subtitle
        body
        topics {
          id
          title
          slug
        }
        authors {
          id
          name
          slug
          userpic
          caption
        }
      }
    }
  }
`
