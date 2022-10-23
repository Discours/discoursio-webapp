import { gql } from '@urql/core'


export default gql`
  mutation CreateShoutMutations($shout: ShoutInput!) {
    createShout(input: $shout) {
      error
      shout {
        _id: slug
        slug
        title
        subtitle
        image
        body
        topics {
          _id: slug
          title
          slug
          image
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
