import type { Shout } from '../../graphql/schema/core.gen'
import type { PageProps } from '../../utils/types'

import { redirectPage } from '@nanostores/router'
import { Show, createMemo, createSignal, onMount } from 'solid-js'

import { FullArticle } from '../../components/Article/FullArticle'
import { Loading } from '../../components/_shared/Loading'
import { PageLayout } from '../../components/_shared/PageLayout'
import { ReactionsProvider } from '../../context/reactions'
import { router, useRouter } from '../../stores/router'
import { loadShout, useArticlesStore } from '../../stores/zine/articles'
import { setPageLoadManagerPromise } from '../../utils/pageLoadManager'

export const ArticlePage = (props: PageProps) => {
  const shouts = props.article ? [props.article] : []
  const { page } = useRouter()

  const slug = createMemo(() => page().params['slug'] as string)

  const { articleEntities } = useArticlesStore({
    shouts
  })

  const article = createMemo<Shout>(() => articleEntities()[slug()])

  onMount(async () => {
    if (!article()?.body) {
      const loadShoutPromise = loadShout(slug())
      setPageLoadManagerPromise(loadShoutPromise)
      await loadShoutPromise

      if (!article()) {
        redirectPage(router, 'fourOuFour')
      }
    }
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
