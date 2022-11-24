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
        topics {
          _id: slug
          title
          slug
        }
        authors {
          _id: slug
          name
          slug
          userpic
          caption
        }
      }
    }
  }
`
