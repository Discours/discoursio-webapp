import { gql } from '@urql/core'

export default gql`
  mutation CommunityCreateMutation($title: String!, $desc: String!) {
    createCommunity(title: $title, desc: $desc) {
      id
      desc
      name
      pic
      createdAt
      createdBy
    }
  }
`
