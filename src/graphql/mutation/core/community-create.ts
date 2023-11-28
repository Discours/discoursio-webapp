import { gql } from '@urql/core'

export default gql`
  mutation CommunityCreateMutation($title: String!, $desc: String!) {
    create_community(title: $title, desc: $desc) {
      id
      desc
      name
      pic
      created_at
      created_by
    }
  }
`
