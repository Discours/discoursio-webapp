import { gql } from '@urql/core'

export default gql`
  query ReactionsByAuthorQuery($author: String!, $page: Int!, $size: Int!) {
    reactionsByAuthor(slug: $author, page: $page, size: $size) {
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
