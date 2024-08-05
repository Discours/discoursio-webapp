import { RouteSectionProps, createAsync } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { Show, Suspense, createEffect, createMemo, createSignal } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { TopicFeedSortBy, TopicView } from '~/components/Views/Topic'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { useTopics } from '~/context/topics'
import { loadShouts, loadTopics } from '~/graphql/api/public'
import { Author, LoadShoutsOptions, Shout, Topic } from '~/graphql/schema/core.gen'
import { getImageUrl } from '~/lib/getThumbUrl'
import { descFromBody } from '~/utils/meta'
import { SHOUTS_PER_PAGE } from '../../(main)'

const fetchTopicShouts = async (slug: string, offset?: number) => {
  const opts: LoadShoutsOptions = { filters: { topic: slug }, limit: SHOUTS_PER_PAGE, offset }
  const shoutsLoader = loadShouts(opts)
  return await shoutsLoader()
}

const fetchAllTopics = async () => {
  const topicsFetcher = loadTopics()
  return await topicsFetcher()
}

export const route = {
  load: async ({ params, location: { query } }: RouteSectionProps<{ articles: Shout[] }>) => {
    const offset: number = Number.parseInt(query.offset, 10)
    const result = await fetchTopicShouts(params.slug, offset)
    return {
      articles: result,
      topics: await fetchAllTopics()
    }
  }
}
export type TopicPageProps = { articles?: Shout[]; topics: Topic[]; authors?: Author[] }

export default function TopicPage(props: RouteSectionProps<TopicPageProps>) {
  const { t } = useLocalize()
  const { addTopics } = useTopics()
  const [loadingError, setLoadingError] = createSignal(false)

  const topic = createAsync(async () => {
    try {
      const ttt: Topic[] = props.data.topics || (await fetchAllTopics()) || []
      addTopics(ttt)
      console.debug('[route.topic] all topics loaded')
      const t = ttt.find((x) => x.slug === props.params.slug)
      return t
    } catch (_error) {
      setLoadingError(true)
      return null
    }
  })

  const articles = createAsync(
    async () => props.data.articles || (await fetchTopicShouts(props.params.slug)) || []
  )

  const title = createMemo(() => `${t('Discours')}${ topic()?.title ? (` :: ${topic()?.title}`) : '' }`)

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
      ? descFromBody(topic()?.body || '')
      : t('The most interesting publications on the topic', { topicName: title() })
  )

  const cover = createMemo(() =>
    topic()?.pic
      ? getImageUrl(topic()?.pic || '', { width: 1200 })
      : getImageUrl('production/image/logo_image.png')
  )

  return (
    <Suspense fallback={<Loading />}>
      <Show
        when={!loadingError()}
        fallback={
          <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
            <FourOuFourView />
            <HttpStatusCode code={404} />
          </PageLayout>
        }
      >
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
            selectedTab={props.params.tab as TopicFeedSortBy}
          />
        </PageLayout>
      </Show>
    </Suspense>
  )
}
