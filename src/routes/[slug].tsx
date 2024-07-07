import { RouteDefinition, RouteSectionProps, createAsync, redirect, useLocation, useParams } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config'
import { useFeed } from '~/context/feed'
import { useLocalize } from '~/context/localize'
import { getShout } from '~/graphql/api/public'
import type { Shout } from '~/graphql/schema/core.gen'
import { initGA, loadGAScript } from '~/utils/ga'
import { FullArticle } from '../components/Article/FullArticle'
import { PageLayout } from '../components/_shared/PageLayout'
import { ReactionsProvider } from '../context/reactions'


const fetchShout = async (slug: string): Promise<Shout> => {
  const shoutLoader = getShout({ slug })
  const shout = await shoutLoader()
  if (!shout) {
    throw new Error('Shout not found')
  }
  return shout
}


export const route: RouteDefinition = {
  load: async ({ params }) => {
    try {
      return await fetchShout(params.slug)
    } catch (error) {
      console.error('Error loading shout:', error)
      throw new Response(null, {
        status: 404,
        statusText: 'Not Found'
      })
    }
  }
}

export default (props: RouteSectionProps<{ article: Shout }>) => {
  const params = useParams()
  const loc = useLocation()
  const { articleEntities } = useFeed()
  const { t } = useLocalize()
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)

  const article = createAsync(async () => {
    if (params.slug && articleEntities?.()) {
      return articleEntities()?.[params.slug] || props.data.article || await fetchShout(params.slug)
    }
    throw redirect('/404', { status: 404 })
  })

  const title = createMemo(() => `${article()?.authors?.[0]?.name || t('Discours')} :: ${article()?.title || ''}`)

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

  createEffect(on(article, (a?: Shout) => {
    if (!a) return
    window?.gtag?.('event', 'page_view', {
      page_title: a.title,
      page_location: window?.location.href || '',
      page_path: loc.pathname
    })
  }, { defer: true }))

  return (
    <ErrorBoundary fallback={() => <HttpStatusCode code={404} />}>
      <Show when={article()?.id} fallback={<Loading />}>
        <PageLayout
          title={title()}
          headerTitle={article()?.title || ''}
          slug={article()?.slug}
          articleBody={article()?.body}
          cover={article()?.cover || ''}
          scrollToComments={(value) => setScrollToComments(value)}
        >
          <ReactionsProvider>
            <FullArticle article={article() as Shout} scrollToComments={scrollToComments()} />
          </ReactionsProvider>
        </PageLayout>
      </Show>
    </ErrorBoundary>
  )
}
