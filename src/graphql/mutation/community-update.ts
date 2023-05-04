import { gql } from '@urql/core'

export default gql`
  mutation CommunityUpdateMutation($community: Community!) {
    updateCommunity(community: $community) {
      id
      slug
      desc
      name
      pic
      createdAt
      createdBy
    }
  }
`
