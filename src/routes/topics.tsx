import { type RouteDefinition, type RouteSectionProps, createAsync, useSearchParams } from '@solidjs/router'
import { Suspense, createEffect, createSignal, on } from 'solid-js'
import { Topic, TopicStat } from '~/graphql/schema/core.gen'
import { loadTopics } from '~/lib/api'
import { byTopicStatDesc } from '~/utils/sortby'
import { AllTopics } from '../components/Views/AllTopics'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'

const fetchData = async () => {
  const topicsFetcher = loadTopics()
  return await topicsFetcher()
}

export const route = { load: loadTopics } satisfies RouteDefinition

export default function HomePage(props: RouteSectionProps<{ topics: Topic[] }>) {
  const { t } = useLocalize()
  const topics = createAsync<Topic[]>(async () => props.data.topics || (await fetchData()) || [])
  const [topicsSort, setTopicsSort] = createSignal<string>('shouts')
  const [searchParams] = useSearchParams<{ by?: string }>()
  createEffect(on(() => searchParams?.by || 'shouts', setTopicsSort))

  return (
    <PageLayout withPadding={true} title={`${t('Discours')}:${t('All topics')}`}>
      <ReactionsProvider>
        <Suspense fallback={<Loading />}>
          <AllTopics topics={topics()?.sort(byTopicStatDesc(topicsSort() as keyof TopicStat)) || []} />
        </Suspense>
      </ReactionsProvider>
    </PageLayout>
  )
}
