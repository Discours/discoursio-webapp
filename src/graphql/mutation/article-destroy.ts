import { gql } from '@urql/core'


export default gql`
  mutation DeleteShoutMutation($shout: String!) {
    deleteShout(slug: $shout) {
      error
    }
  }
`
