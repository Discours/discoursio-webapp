import { gql } from '@urql/core'

export default gql`
  mutation MarkThreadSeen($thread: String!, $after: Int) {
    mark_seen_thread(thread: $thread, after: $after) {
      error
    }
  }
`
