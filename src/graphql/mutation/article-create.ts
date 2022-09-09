import { gql } from '@urql/core'

// TODO: sync with backend

export default gql`
  mutation ArticleMutation($article: Shout!) {
    createArticle(article: $article) {
      error
      shout {
        _id: slug
        slug
        title
        subtitle
        image
        body
        topics {
          _id: slug
          title
          slug
          image
        }
        authors {
          _id: slug
          name
          slug
          userpic
          caption
        }
      }
    }
  }
`
