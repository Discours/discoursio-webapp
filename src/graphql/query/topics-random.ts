import { gql } from '@urql/core'

export default gql`
  query TopicsRandomQuery {
    topicsRandom {
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
