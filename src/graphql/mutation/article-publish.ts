import { gql } from '@urql/core'

export default gql`
  mutation PublishShoutMutation($slug: String!) {
    publishShout(slug: $slug) {
      error
      shout {
        id
        slug
        title
        subtitle
        body
      }
    }
  }
`
