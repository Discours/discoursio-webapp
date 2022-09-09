import { gql } from '@urql/core'

export default gql`
  query ReactionsByShoutQuery($slug: String!, $page: Int!, $size: Int!) {
    reactionsByShout(slug: $slug, page: $page, size: $size) {
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
