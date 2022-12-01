import { gql } from '@urql/core'
// WARNING: need Auth header

export default gql`
  mutation ProfileUpdateMutation($profile: ProfileInput!) {
    updateProfile(profile: $profile) {
      error
      author {
        name
        slug
        userpic
        bio
        links
      }
    }
  }
`
