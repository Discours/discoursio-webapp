import { RouteDefinition, RouteSectionProps, createAsync, useLocation, useParams } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import {
  ErrorBoundary,
  Show,
  Suspense,
  createEffect,
  createMemo,
  createSignal,
  on,
  onMount
} from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config'
import { useLocalize } from '~/context/localize'
import { getShout } from '~/graphql/api/public'
import type { Reaction, Shout } from '~/graphql/schema/core.gen'
import { initGA, loadGAScript } from '~/utils/ga'
import { getArticleKeywords } from '~/utils/meta'
import { FullArticle } from '../components/Article/FullArticle'
import { PageLayout } from '../components/_shared/PageLayout'
import { ReactionsProvider } from '../context/reactions'

const fetchShout = async (slug: string): Promise<Shout | undefined> => {
  const shoutLoader = getShout({ slug })
  const result = await shoutLoader()
  return result
}

export const route: RouteDefinition = {
  load: async ({ params }) => ({
    article: await fetchShout(params.slug)
  })
}

export default (
  props: RouteSectionProps<{ article?: Shout; comments?: Reaction[]; votes?: Reaction[] }>
) => {
  const params = useParams()
  const loc = useLocation()
  const { t } = useLocalize()
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)
  const article = createAsync(async () => props.data.article || (await fetchShout(params.slug)))

  const title = createMemo(
    () => `${article()?.authors?.[0]?.name || t('Discours')} :: ${article()?.title || ''}`
  )

  onMount(async () => {
    if (gaIdentity && article()?.id) {
      try {
        await loadGAScript(gaIdentity)
        initGA(gaIdentity)
      } catch (error) {
        console.warn('Failed to connect Google Analytics:', error)
      }
    }
  })

  createEffect(
    on(
      article,
      (a?: Shout) => {
        if (!a?.id) return
        window?.gtag?.('event', 'page_view', {
          page_title: a.title,
          page_location: window?.location.href || '',
          page_path: loc.pathname
        })
      },
      { defer: true }
    )
  )

  return (
    <ErrorBoundary fallback={() => <HttpStatusCode code={500} />}>
      <Suspense fallback={<Loading />}>
        <Show
          when={article()?.id}
          fallback={
            <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
              <FourOuFourView />
              <HttpStatusCode code={404} />
            </PageLayout>
          }
        >
          <PageLayout
            title={title()}
            desc={getArticleKeywords(article() as Shout)}
            headerTitle={article()?.title || ''}
            slug={article()?.slug}
            cover={article()?.cover || ''}
            scrollToComments={(value) => setScrollToComments(value)}
          >
            <ReactionsProvider>
              <FullArticle article={article() as Shout} scrollToComments={scrollToComments()} />
            </ReactionsProvider>
          </PageLayout>
        </Show>
      </Suspense>
    </ErrorBoundary>
  )
}
