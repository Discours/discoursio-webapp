import { gql } from '@urql/core'

export default gql`
  mutation ProfileUpdateMutation($profile: ProfileInput!) {
    updateProfile(profile: $profile) {
      error
      author {
        name
      }
    }
  }
`
