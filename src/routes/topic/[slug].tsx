import { RouteSectionProps, createAsync, useParams } from '@solidjs/router'
import { ErrorBoundary, Suspense, createEffect, createMemo } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { TopicView } from '~/components/Views/Topic'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { useTopics } from '~/context/topics'
import { loadShouts } from '~/graphql/api/public'
import { LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { getImageUrl } from '~/lib/getImageUrl'
import { getArticleDescription } from '~/utils/meta'
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

export default (props: RouteSectionProps<{ articles: Shout[] }>) => {
  const params = useParams()
  const articles = createAsync(async () => props.data.articles || (await fetchTopicShouts(params.slug)) || [])
  const { topicEntities } = useTopics()
  const { t } = useLocalize()
  const topic = createMemo(() => topicEntities?.()[params.slug])
  const title = createMemo(() => `${t('Discours')} :: ${topic()?.title || ''}`)
  createEffect(() => {
    if (topic() && window) {
      window?.gtag?.('event', 'page_view', {
        page_title: topic()?.title,
        page_location: window?.location.href,
        page_path: window?.location.pathname
      })
    }
  })
  const desc = createMemo(() =>
    topic()?.body
      ? getArticleDescription(topic()?.body || '')
      : t('The most interesting publications on the topic', { topicName: title() })
  )
  const cover = createMemo(() =>
    topic()?.pic
      ? getImageUrl(topic()?.pic || '', { width: 1200 })
      : getImageUrl('production/image/logo_image.png')
  )
  return (
    <ErrorBoundary fallback={(_err) => <FourOuFourView />}>
      <Suspense fallback={<Loading />}>
        <PageLayout
          key="topic"
          title={title()}
          desc={desc()}
          headerTitle={topic()?.title || ''}
          slug={topic()?.slug}
          cover={cover()}
        >
          <TopicView
            topic={topic() as Topic}
            topicSlug={props.params.slug}
            shouts={articles() as Shout[]}
          />
        </PageLayout>
      </Suspense>
    </ErrorBoundary>
  )
}
