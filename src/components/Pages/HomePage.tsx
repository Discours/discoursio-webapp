import { HomeView, PRERENDERED_ARTICLES_COUNT } from '../Views/Home'
import { MainLayout } from '../Layouts/MainLayout'
import type { PageProps } from '../types'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadPublishedArticles, resetSortedArticles } from '../../stores/zine/articles'
import { loadRandomTopics } from '../../stores/zine/topics'
import { Loading } from '../Loading'
import { InboxView } from '../Views/Inbox'
export const HomePage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.homeArticles) && Boolean(props.randomTopics))

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
    <MainLayout>
      <Show when={isLoaded()} fallback={<Loading />}>
        <InboxView />
        <HomeView randomTopics={props.randomTopics} recentPublishedArticles={props.homeArticles || []} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default HomePage
