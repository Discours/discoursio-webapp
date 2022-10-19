import { MainLayout } from '../Layouts/MainLayout'
import { FeedView } from '../Views/Feed'
import type { PageProps } from '../types'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadRecentArticles, resetSortedArticles } from '../../stores/zine/articles'
import { Loading } from '../Loading'

export const FeedPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.feedArticles))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadRecentArticles({ limit: 50, offset: 0 })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <MainLayout>
      <Show when={isLoaded()} fallback={<Loading />}>
        <FeedView articles={props.feedArticles} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default FeedPage
