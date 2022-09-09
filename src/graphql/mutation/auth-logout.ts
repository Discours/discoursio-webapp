import { gql } from '@urql/core'

// WARNING: need Auth header

export default gql`
  query SignOutQuery {
    signOut {
      error
    }
  }
`
