import { gql } from '@urql/core'

export default gql`
  query ReactionsByShoutQuery($limit: String!, $limit: Int!, $offset: Int!) {
    reactionsByShout(slug: $slug, limit: $limit, offset: $offset) {
      id
      body
      createdAt
      createdBy {
        _id: slug
        name
        slug
        userpic
      }
      updatedAt
      replyTo {
        id
      }
      kind
      range
      stat {
        _id: viewed
        viewed
        reacted
        rating
      }
    }
  }
`
