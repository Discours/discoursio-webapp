import { PageWrap } from '../_shared/PageWrap'
import { ArticleView } from '../Views/Article'
import type { PageProps } from '../types'
import { loadShout, useArticlesStore } from '../../stores/zine/articles'
import { createMemo, onMount, Show } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { useRouter } from '../../stores/router'
import { Loading } from '../Loading'

export const ArticlePage = (props: PageProps) => {
  const shouts = props.article ? [props.article] : []

  const slug = createMemo(() => {
    const { page: getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'article') {
      throw new Error('ts guard')
    }

    return page.params.slug
  })

  const { articleEntities } = useArticlesStore({
    shouts
  })

  const article = createMemo<Shout>(() => articleEntities()[slug()])

  onMount(async () => {
    const articleValue = articleEntities()[slug()]

    if (!articleValue || !articleValue.body) {
      await loadShout(slug())
    }
  })

  return (
    <PageWrap headerTitle={article()?.title || ''}>
      <Show when={Boolean(article())} fallback={<Loading />}>
        <ArticleView article={article()} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default ArticlePage
