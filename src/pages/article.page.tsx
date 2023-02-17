import { createMemo, onMount, Show } from 'solid-js'
import type { Shout } from '../graphql/types.gen'
import { PageLayout } from '../components/_shared/PageLayout'
import { ArticleView } from '../components/Views/Article'
import type { PageProps } from './types'
import { loadShout, useArticlesStore } from '../stores/zine/articles'
import { useRouter } from '../stores/router'
import { Loading } from '../components/_shared/Loading'
import { ReactionsProvider } from '../context/reactions'

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

  onMount(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://ackee.discours.io/increment.js'
    script.dataset.ackeeServer = 'https://ackee.discours.io'
    script.dataset.ackeeDomainId = '1004abeb-89b2-4e85-ad97-74f8d2c8ed2d'
    document.body.appendChild(script)
  })

  return (
    <PageLayout headerTitle={article()?.title || ''} articleBody={article()?.body} cover={article()?.cover}>
      <ReactionsProvider>
        <Show when={Boolean(article())} fallback={<Loading />}>
          <ArticleView article={article()} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = ArticlePage
