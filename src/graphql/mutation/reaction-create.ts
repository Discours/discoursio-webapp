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
        createdBy {
          name
          #          slug
          userpic
        }
      }
    }
  }
`
