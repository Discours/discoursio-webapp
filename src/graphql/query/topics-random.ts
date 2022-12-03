import { gql } from '@urql/core'

export default gql`
  query TopicsRandomQuery($amount: Int) {
    topicsRandom(amount: $amount) {
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
