import type { PageProps } from './types'
import type { Shout } from '../graphql/types.gen'

import { redirectPage } from '@nanostores/router'
import { createMemo, createSignal, onMount, Show } from 'solid-js'

import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { FullArticle } from '../components/Article/FullArticle'
import { ReactionsProvider } from '../context/reactions'
import { router, useRouter } from '../stores/router'
import { loadShout, useArticlesStore } from '../stores/zine/articles'
import { setPageLoadManagerPromise } from '../utils/pageLoadManager'

export const ArticlePage = (props: PageProps) => {
  const shouts = props.article ? [props.article] : []
  const { page } = useRouter()

  const slug = createMemo(() => page().params['slug'] as string)

  const { articleEntities } = useArticlesStore({
    shouts,
  })

  const article = createMemo<Shout>(() => articleEntities()[slug()])

  onMount(async () => {
    if (!article() || !article().body) {
      const loadShoutPromise = loadShout(slug())
      setPageLoadManagerPromise(loadShoutPromise)
      await loadShoutPromise

      if (!article()) {
        redirectPage(router, 'fourOuFour')
      }
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
      title={props.seo?.title}
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
