import { gql } from '@urql/core'

export default gql`
  query TopicsByAuthorQuery($slug: String!) {
    topicsByAuthor(author: $slug) {
      title
      body
      slug
      pic
      # community
      stat {
        shouts
        authors
        followers
      }
    }
  }
`
