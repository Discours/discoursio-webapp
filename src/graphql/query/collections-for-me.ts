import { gql } from '@urql/core'

export default gql`
  query {
    getMyCollections {
      id
      title
      desc
      slug
      amount
    }
  }
`
