import { gql } from '@urql/core'

export default gql`
  mutation FollowQuery($what: String!, $slug: String!) {
    follow(what: $what, slug: $slug) {
      error
    }
  }
`
