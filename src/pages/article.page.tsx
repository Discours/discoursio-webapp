import { createMemo, createSignal, onMount, Show } from 'solid-js'
import type { Shout } from '../graphql/types.gen'
import { PageLayout } from '../components/_shared/PageLayout'
import type { PageProps } from './types'
import { loadShout, useArticlesStore } from '../stores/zine/articles'
import { useRouter } from '../stores/router'
import { Loading } from '../components/_shared/Loading'
import { ReactionsProvider } from '../context/reactions'
import { FullArticle } from '../components/Article/FullArticle'
import { setPageLoadManagerPromise } from '../utils/pageLoadManager'

export const ArticlePage = (props: PageProps) => {
  const shouts = props.article ? [props.article] : []
  const { page } = useRouter()

  const slug = createMemo(() => page().params['slug'] as string)

  const { articleEntities } = useArticlesStore({
    shouts
  })

  const article = createMemo<Shout>(() => articleEntities()[slug()])

  onMount(async () => {
    const articleValue = articleEntities()[slug()]

    if (!articleValue || !articleValue.body) {
      const loadShoutPromise = loadShout(slug())
      setPageLoadManagerPromise(loadShoutPromise)
      await loadShoutPromise
      // тут видимо тоже что-то нужно написать
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
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)

  return (
    <PageLayout
      headerTitle={article()?.title || ''}
      slug={article()?.slug}
      articleBody={article()?.body}
      cover={article()?.cover}
      scrollToComments={(value) => {
        setScrollToComments(value)
      }}
    >
      <ReactionsProvider>
        <Show when={Boolean(article())} fallback={<Loading />}>
          <FullArticle article={article()} scrollToComments={scrollToComments()} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = ArticlePage
