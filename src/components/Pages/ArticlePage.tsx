import { MainLayout } from '../Layouts/MainLayout'
import { ArticleView } from '../Views/Article'
import type { PageProps } from '../types'
import { loadArticle, useArticlesStore } from '../../stores/zine/articles'
import { createMemo, onMount, Show } from 'solid-js'
import { t } from '../../utils/intl'
import type { Shout } from '../../graphql/types.gen'
import { useRouter } from '../../stores/router'

export const ArticlePage = (props: PageProps) => {
  const sortedArticles = props.article ? [props.article] : []

  const { getPage } = useRouter()

  const page = getPage()

  if (page.route !== 'article') {
    throw new Error('ts guard')
  }

  const { getArticleEntities } = useArticlesStore({
    sortedArticles
  })

  const article = createMemo<Shout>(() => getArticleEntities()[page.params.slug])

  onMount(() => {
    const slug = page.params.slug
    const article = getArticleEntities()[slug]

    if (!article || !article.body) {
      loadArticle({ slug })
    }
  })

  return (
    <MainLayout headerTitle={article()?.title || ''}>
      <Show when={Boolean(article())} fallback={t('Loading')}>
        <ArticleView article={article()} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default ArticlePage
