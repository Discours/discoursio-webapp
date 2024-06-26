import { RouteSectionProps, createAsync } from '@solidjs/router'
import { ErrorBoundary, Suspense, createMemo, createSignal, onMount } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config/config'
import { useLocalize } from '~/context/localize'
import { getShout } from '~/lib/api'
import { initGA, loadGAScript } from '~/utils/ga'
import { FullArticle } from '../components/Article/FullArticle'
import { PageLayout } from '../components/_shared/PageLayout'
import { ReactionsProvider } from '../context/reactions'
import type { Shout } from '../graphql/schema/core.gen'

const fetchShout = async (slug: string) => {
  const shoutLoader = getShout({ slug })
  return await shoutLoader()
}

export const route = {
  load: async ({ params }: RouteSectionProps<{ article: Shout }>) => {
    const article = await fetchShout(params.slug)
    return { article }
  }
}

export const ArticlePage = (props: RouteSectionProps<{ article: Shout }>) => {
  const article = createAsync(async () => props.data.article || (await fetchShout(props.params.slug)))
  const { t } = useLocalize()
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)
  const title = createMemo(
    () => `${article()?.authors?.[0]?.name || t('Discours')}: ${article()?.title || ''}`
  )
  onMount(async () => {
    try {
      await loadGAScript(gaIdentity)
      initGA(gaIdentity)
      console.debug('Google Analytics connected successfully')
    } catch (error) {
      console.warn('Failed to connect Google Analytics:', error)
    }
  })
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

export const Page = ArticlePage
