import { gql } from '@urql/core'

export default gql`
  query ResetQuery($code: String!) {
    reset(code: $code) {
      error
    }
  }
`
