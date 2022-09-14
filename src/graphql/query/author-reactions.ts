import { gql } from '@urql/core'

export default gql`
  query ReactionsByAuthorQuery($author: String!, $limit: Int!, $offset: Int!) {
    reactionsByAuthor(slug: $author, limit: $limit, offset: $offset) {
      id
      body
      createdAt
      updatedAt
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
