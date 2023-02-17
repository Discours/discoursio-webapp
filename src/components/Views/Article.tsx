import { FullArticle } from '../Article/FullArticle'
import type { Shout } from '../../graphql/types.gen'

interface ArticlePageProps {
  article: Shout
}

export const ArticleView = (props: ArticlePageProps) => {
  return <FullArticle article={props.article} />
}
