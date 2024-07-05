import { RouteSectionProps, createAsync, useParams } from '@solidjs/router'
import { ErrorBoundary, Suspense, createMemo, createReaction } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { TopicView } from '~/components/Views/Topic'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { ReactionsProvider } from '~/context/reactions'
import { useTopics } from '~/context/topics'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { SHOUTS_PER_PAGE } from '../(home)'

const fetchTopicShouts = async (slug: string, offset?: number) => {
  const opts: LoadShoutsOptions = { filters: { topic: slug }, limit: SHOUTS_PER_PAGE, offset }
  const shoutsLoader = loadShouts(opts)
  return await shoutsLoader()
}

export const route = {
  load: async ({ params, location: { query } }: RouteSectionProps<{ articles: Shout[] }>) => {
    const offset: number = Number.parseInt(query.offset, 10)
    const result = await fetchTopicShouts(params.slug, offset)
    return result
  }
}

export const TopicPage = (props: RouteSectionProps<{ articles: Shout[] }>) => {
  const params = useParams()
  const articles = createAsync(
    async () => props.data.articles || (await fetchTopicShouts(params.slug)) || []
  )
  const { topicEntities } = useTopics()
  const { t } = useLocalize()
  const topic = createMemo(() => topicEntities?.()[params.slug])
  const title = createMemo(() => `${t('Discours')} :: ${topic()?.title || ''}`)

  // docs: `a side effect that is run the first time the expression
  // wrapped by the returned tracking function is notified of a change`
  createReaction(() => {
    if (topic()) {
      console.debug('[routes.slug] article signal changed once')
      window.gtag?.('event', 'page_view', {
        page_title: topic()?.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      })
    }
  })
  return (
    <ErrorBoundary fallback={(_err) => <FourOuFourView />}>
      <Suspense fallback={<Loading />}>
        <PageLayout
          title={title()}
          headerTitle={topic()?.title || ''}
          slug={topic()?.slug}
          articleBody={topic()?.body || ''}
          cover={topic()?.pic || ''}
        >
          <ReactionsProvider>
            <TopicView
              topic={topic() as Topic}
              topicSlug={props.params.slug}
              shouts={articles() as Shout[]}
            />
          </ReactionsProvider>
        </PageLayout>
      </Suspense>
    </ErrorBoundary>
  )
}

export default TopicPage
