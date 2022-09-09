import { gql } from '@urql/core'

// TODO: sync with backend

export default gql`
  mutation ArticleMutation($article_id: Int!) {
    destroyArticle(article: $article_id) {
      error
    }
  }
`
