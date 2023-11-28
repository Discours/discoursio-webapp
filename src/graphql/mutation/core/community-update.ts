import { gql } from '@urql/core'

export default gql`
  mutation CommunityUpdateMutation($community: Community!) {
    update_community(community: $community) {
      id
      slug
      desc
      name
      pic
      created_at
      created_by
    }
  }
`
