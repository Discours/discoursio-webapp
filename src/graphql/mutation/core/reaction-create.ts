import { gql } from '@urql/core'

export default gql`
  mutation CreateReactionMutation($reaction: ReactionInput!) {
    create_reaction(reaction: $reaction) {
      error
      reaction {
        id
        body
        kind
        range
        created_at
        reply_to
        stat {
          rating
        }
        shout {
          id
          slug
        }
        created_by {
          name
          slug
          pic
        }
      }
    }
  }
`
