import { gql } from '@urql/core'

export default gql`
  mutation ArticleMutation($article: Shout!) {
    updateArticle(article: $article) {
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
