import { gql } from '@urql/core'

export default gql`
  mutation UpdateShoutMutation($shout: Shout!) {
    updateShout(input: $shout) {
      error
      shout {
        _id: slug
        slug
        title
        subtitle
        image
        body
        topics {
          # id
          title
          slug
          image
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
