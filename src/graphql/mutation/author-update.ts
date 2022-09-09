import { gql } from '@urql/core'
// WARNING: need Auth header

export default gql`
  mutation ProfileUpdateMutation($user: User!) {
    profileUpdate(user: $user) {
      error
      token
      user {
        _id: slug
        name
        slug
        userpic
        bio
        # links
      }
    }
  }
`
