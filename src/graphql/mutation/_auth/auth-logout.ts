import { gql } from '@urql/core'

export default gql`
  query SignOutQuery {
    signOut {
      error
    }
  }
`
