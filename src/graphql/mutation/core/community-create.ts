import { gql } from '@urql/core'

export default gql`
  mutation CommunityCreateMutation($community: CommunityInput!) {
    create_community(community: $community) {
      community {
        id
        desc
        name
        pic
        created_at
        created_by
      }
      error
  }
`
