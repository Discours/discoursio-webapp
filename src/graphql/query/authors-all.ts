import { gql } from '@urql/core'

export default gql`
  query AuthorssAllQuery($limit: Int!, $offset: Int!) {
    authorsAll(limit: $limit, offset: $offset) {
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
