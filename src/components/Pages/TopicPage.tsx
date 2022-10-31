import { MainLayout } from '../Layouts/MainLayout'
import { PRERENDERED_ARTICLES_COUNT, TopicView } from '../Views/Topic'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadTopicArticles, resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { loadTopic } from '../../stores/zine/topics'
import { Loading } from '../Loading'

export const TopicPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.authorArticles) && Boolean(props.author))

  const slug = createMemo(() => {
    const { page: getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'topic') {
      throw new Error('ts guard')
    }

    return page.params.slug
  })

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadTopicArticles({ topicSlug: slug(), limit: PRERENDERED_ARTICLES_COUNT, offset: 0 })
    await loadTopic({ slug: slug() })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <MainLayout>
      <Show when={isLoaded()} fallback={<Loading />}>
        <TopicView topic={props.topic} topicArticles={props.topicArticles} topicSlug={slug()} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default TopicPage
