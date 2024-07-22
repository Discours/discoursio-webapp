import { gql } from '@urql/core'

export default gql`
  query LoadReactions($shout: Int!, $limit: Int, $offset: Int) {
    load_shout_comments(shout: $shout, limit: $limit, offset: $offset) {
      id
      kind
      body
      reply_to
      shout {
        id
        slug
        title
      }
      created_by {
        id
        name
        slug
        pic
        created_at
      }
      created_at
      updated_at
      stat {
        rating
      }
    }
  }
`
