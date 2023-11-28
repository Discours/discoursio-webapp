import { gql } from '@urql/core'

export default gql`
  mutation ProfileUpdateMutation($profile: ProfileInput!) {
    update_profile(profile: $profile) {
      error
      author {
        name
      }
    }
  }
`
