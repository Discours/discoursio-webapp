import { gql } from '@urql/core'

export default gql`
  query TopicsByAuthorQuery($slug: String!) {
    topicsByAuthor(author: $slug) {
      title
      body
      slug
      pic
      parents
      children
      # community
      stat {
        _id: shouts
        shouts
        authors
        # viewed
        followers
      }
    }
  }
`
