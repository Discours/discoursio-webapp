import { gql } from '@urql/core'

export default gql`
  mutation PublishShoutMutation($slug: String!, $shout: ShoutInput!) {
    publishShout(slug: $slug, inp: $shout) {
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
