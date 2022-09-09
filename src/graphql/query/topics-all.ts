import { gql } from '@urql/core'

export default gql`
  query TopicsAllQuery {
    topicsAll {
      _id: slug
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
