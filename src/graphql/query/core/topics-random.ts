import { gql } from '@urql/core'

export default gql`
  query TopicsRandomQuery($amount: Int) {
    get_topics_random(amount: $amount) {
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
      }
    }
  }
`
