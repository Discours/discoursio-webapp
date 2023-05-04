import { gql } from '@urql/core'

export default gql`
  query TopicsAllQuery {
    topicsAll {
      title
      body
      slug
      pic
      # community
      stat {
        shouts
        authors
        followers
        # viewed
      }
    }
  }
`
