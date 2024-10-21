import { gql } from '@urql/core'

export default gql`
  mutation CommunityUpdateMutation($input: CommunityInput!) {
    update_community(input: $input) {
      error
      community {
        id
        slug
        desc
        name
        pic
        created_at
        created_by {
          id
          slug
          name
          pic
        }
      }
    }
  }
`
