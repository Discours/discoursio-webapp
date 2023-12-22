import { gql } from '@urql/core'

export default gql`
  mutation MarkSeenAfter($after: Int) {
    mark_seen_after(after: $after) {
      error
    }
  }
`
