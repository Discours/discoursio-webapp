import { PageWrap } from '../_shared/PageWrap'
import { PRERENDERED_ARTICLES_COUNT, TopicView } from '../Views/Topic'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadShoutsBy, resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { loadTopic } from '../../stores/zine/topics'
import { Loading } from '../Loading'

export const TopicPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.shouts) && Boolean(props.topic))

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

    await loadShoutsBy({ by: { topics: [slug()] }, limit: PRERENDERED_ARTICLES_COUNT, offset: 0 })
    await loadTopic({ slug: slug() })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <TopicView topic={props.topic} shouts={props.shouts} topicSlug={slug()} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default TopicPage
