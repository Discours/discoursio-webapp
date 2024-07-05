import { RouteSectionProps, createAsync, useLocation, useParams } from '@solidjs/router'
import { ErrorBoundary, Suspense, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config'
import { useLocalize } from '~/context/localize'
import { getShout } from '~/graphql/api/public'
import type { Shout } from '~/graphql/schema/core.gen'
import { initGA, loadGAScript } from '~/utils/ga'
import { FullArticle } from '../components/Article/FullArticle'
import { PageLayout } from '../components/_shared/PageLayout'
import { ReactionsProvider } from '../context/reactions'

const fetchShout = async (slug: string) => {
  const shoutLoader = getShout({ slug })
  return await shoutLoader()
}

export const route = {
  load: async ({ params }: RouteSectionProps<{ article: Shout }>) => await fetchShout(params.slug)
}

export default (props: RouteSectionProps<{ article: Shout }>) => {
  const params = useParams()
  const loc = useLocation()
  const article = createAsync(async () => props.data.article || (await fetchShout(params.slug)))
  const { t } = useLocalize()
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)
  const title = createMemo(
    () => `${article()?.authors?.[0]?.name || t('Discours')} :: ${article()?.title || ''}`
  )
  onMount(async () => {
    if (gaIdentity) {
      try {
        console.info('[routes.slug] mounted, connecting ga...')
        await loadGAScript(gaIdentity)
        initGA(gaIdentity)
        console.debug('[routes.slug] Google Analytics connected successfully')
      } catch (error) {
        console.warn('[routes.slug] Failed to connect Google Analytics:', error)
      }
    }
  })

  createEffect(
    on(
      article,
      (a?: Shout) => {
        if (!a) return
        console.debug('[routes.slug] article found')
        window.gtag?.('event', 'page_view', {
          page_title: a.title,
          page_location: window.location.href,
          page_path: loc.pathname
        })
      },
      { defer: true }
    )
  )

  return (
    <ErrorBoundary fallback={(_err) => <FourOuFourView />}>
      <Suspense fallback={<Loading />}>
        <PageLayout
          title={title()}
          headerTitle={article()?.title || ''}
          slug={article()?.slug}
          articleBody={article()?.body}
          cover={article()?.cover || ''}
          scrollToComments={(value) => {
            setScrollToComments(value)
          }}
        >
          <ReactionsProvider>
            <FullArticle article={article() as Shout} scrollToComments={scrollToComments()} />
          </ReactionsProvider>
        </PageLayout>
      </Suspense>
    </ErrorBoundary>
  )
}
