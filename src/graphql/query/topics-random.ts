import { gql } from '@urql/core'

export default gql`
  query TopicsRandomQuery {
    topicsRandom {
      _id: slug
      title
      body
      slug
      pic
      # community
      stat {
        _id: shouts
        shouts
        authors
        followers
      }
    }
  }
`
