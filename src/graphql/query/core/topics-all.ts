import { gql } from '@urql/core'

export default gql`
  query TopicsAllQuery {
    get_topics_all {
      id
      title
      body
      slug
      pic
      # community
      stat {
        shouts
        authors
        followers
        comments
        # viewed
      }
    }
  }
`
