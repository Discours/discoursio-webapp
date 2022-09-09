import { gql } from '@urql/core'

export default gql`
  mutation UnfollowQuery($what: String!, $slug: String!) {
    unfollow(what: $what, slug: $slug) {
      error
    }
  }
`
