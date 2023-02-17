import { gql } from '@urql/core'

export default gql`
  mutation CreateReactionMutation($reaction: ReactionInput!) {
    createReaction(reaction: $reaction) {
      error
      reaction {
        id
        body
        kind
        range
        createdAt
        replyTo
        stat {
          rating
        }
        shout {
          id
          slug
        }
        createdBy {
          name
          slug
          userpic
        }
      }
    }
  }
`
