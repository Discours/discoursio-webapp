import { MainLayout } from '../Layouts/MainLayout'
import { ArticleView } from '../Views/Article'
import type { PageProps } from '../types'

export const ArticlePage = (props: PageProps) => {
  return (
    <MainLayout headerTitle={'ARTICLE TITLE'}>
      <ArticleView article={props.article} />
    </MainLayout>
  )
}

// for lazy loading
export default ArticlePage
