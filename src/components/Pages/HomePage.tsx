import { HomeView, PRERENDERED_ARTICLES_COUNT } from '../Views/Home'
import { PageWrap } from '../Wraps/PageWrap'
import type { PageProps } from '../types'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadPublishedArticles, resetSortedArticles } from '../../stores/zine/articles'
import { loadRandomTopics } from '../../stores/zine/topics'
import { Loading } from '../Loading'

export const HomePage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.shouts) && Boolean(props.randomTopics))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadPublishedArticles({ limit: PRERENDERED_ARTICLES_COUNT, offset: 0 })
    await loadRandomTopics()

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <HomeView randomTopics={props.randomTopics} recentPublishedArticles={props.shouts || []} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default HomePage
