import { gql } from '@urql/core'

export default gql`
  query GetUserRolesBySlug($slug: String!) {
    getUserRoles(slug: $slug) {
      id
      name
      # community
      desc
      permissions {
        operation_id
        resource_id
      }
    }
  }
`
