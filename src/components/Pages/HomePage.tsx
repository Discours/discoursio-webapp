import { HomeView } from '../Views/Home'
import { MainLayout } from '../Layouts/MainLayout'
import type { PageProps } from '../types'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { t } from '../../utils/intl'
import { loadPublishedArticles, resetSortedArticles } from '../../stores/zine/articles'
import { loadRandomTopics } from '../../stores/zine/topics'

export const HomePage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.homeArticles) && Boolean(props.randomTopics))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadPublishedArticles({ limit: 5, offset: 0 })
    await loadRandomTopics()

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <MainLayout>
      <Show when={isLoaded()} fallback={t('Loading')}>
        <HomeView randomTopics={props.randomTopics} recentPublishedArticles={props.homeArticles || []} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default HomePage
