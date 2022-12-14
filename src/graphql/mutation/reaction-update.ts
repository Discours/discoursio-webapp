import { gql } from '@urql/core'

export default gql`
  mutation UpdateReactionMutation($reaction: ReactionInput!) {
    updateReaction(reaction: $reaction) {
      error
      reaction {
        id
        createdBy {
          slug
          name
          userpic
        }
        body
        kind
        range
        createdAt
        updatedAt
        shout
        replyTo {
          id
          createdBy {
            slug
            userpic
            name
          }
          body
          kind
        }
      }
    }
  }
`
