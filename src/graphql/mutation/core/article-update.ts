import { gql } from '@urql/core'

export default gql`
  mutation UpdateShoutMutation($shoutId: Int!, $shoutInput: ShoutInput, $publish: Boolean) {
    update_shout(shout_id: $shoutId, shout_input: $shoutInput, publish: $publish) {
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
