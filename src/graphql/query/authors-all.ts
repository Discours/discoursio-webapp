import { gql } from '@urql/core'

export default gql`
  query AuthorssAllQuery($page: Int!, $size: Int!) {
    authorsAll(page: $page, size: $size) {
      _id: slug
      slug
      name
      bio
      userpic
      communities
      links
      createdAt
      wasOnlineAt
      ratings {
        _id: rater
        rater
        value
      }
    }
  }
`
