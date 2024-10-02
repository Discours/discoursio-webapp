import { type RouteDefinition, type RouteSectionProps, createAsync } from '@solidjs/router'
import { Suspense, createEffect, on } from 'solid-js'
import { AllTopicsView } from '~/components/Views/AllTopicsView'
import { Loading } from '~/components/_shared/Loading'
import { PageLayout } from '~/components/_shared/PageLayout'
import { useLocalize } from '~/context/localize'
import { useTopics } from '~/context/topics'
import { loadTopics } from '~/graphql/api/public'
import { Topic } from '~/graphql/schema/core.gen'

const fetchData = async () => {
  const topicsFetcher = loadTopics()
  return await topicsFetcher()
}

export const route = { load: loadTopics } satisfies RouteDefinition

export default (props: RouteSectionProps<{ topics: Topic[] }>) => {
  const { t } = useLocalize()
  const topics = createAsync<Topic[]>(async () => props.data.topics || (await fetchData()) || [])
  const { addTopics } = useTopics()
  createEffect(
    on(
      () => topics() || [],
      (ttt: Topic[]) => ttt && addTopics(ttt),
      { defer: true }
    )
  )
  return (
    <PageLayout
      withPadding={true}
      key="topics"
      title={`${t('Discours')} :: ${t('Themes and plots')}`}
      headerTitle={t('All topics')}
      desc="Thematic table of contents of the magazine. Here you can find all the topics that the community authors wrote about"
    >
      <Suspense fallback={<Loading />}>
        <AllTopicsView topics={topics() as Topic[]} />
      </Suspense>
    </PageLayout>
  )
}
