import { gql } from '@urql/core'

export default gql`
  mutation UpdateShoutMutation($shout_id: Int!, $shout_input: ShoutInput, $publish: Boolean) {
    update_shout(shout_id: $shout_id, shout_input: $shout_input, publish: $publish) {
      error
      shout {
        id
        slug
        title
        subtitle
        lead
        description
        body
        created_at
        updated_at
        published_at
        featured_at
      }
    }
  }
`
