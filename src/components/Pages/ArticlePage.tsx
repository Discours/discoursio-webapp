import { MainLayout } from '../Layouts/MainLayout'
import { ArticleView } from '../Views/Article'
import type { PageProps } from '../types'
import { loadArticle, useArticlesStore } from '../../stores/zine/articles'
import { createMemo, onMount, Show } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { useRouter } from '../../stores/router'
import { Loading } from '../Loading'

export const ArticlePage = (props: PageProps) => {
  const sortedArticles = props.article ? [props.article] : []

  const slug = createMemo(() => {
    const { getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'article') {
      throw new Error('ts guard')
    }

    return page.params.slug
  })

  const { articleEntities } = useArticlesStore({
    sortedArticles
  })

  const article = createMemo<Shout>(() => articleEntities()[slug()])

  onMount(() => {
    const articleValue = articleEntities()[slug()]

    if (!articleValue || !articleValue.body) {
      loadArticle({ slug: slug() })
    }
  })

  return (
    <MainLayout headerTitle={article()?.title || ''}>
      <Show when={Boolean(article())} fallback={<Loading />}>
        <ArticleView article={article()} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default ArticlePage
