import { HomeView, PRERENDERED_ARTICLES_COUNT, RANDOM_TOPICS_COUNT } from '../Views/Home'
import { PageWrap } from '../_shared/PageWrap'
import type { PageProps } from '../types'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadShouts, resetSortedArticles } from '../../stores/zine/articles'
import { loadRandomTopics } from '../../stores/zine/topics'
import { Loading } from '../Loading'
import styles from './HomePage.module.scss'

export const HomePage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.shouts) && Boolean(props.randomTopics))

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadShouts({ filters: { visibility: 'public' }, limit: PRERENDERED_ARTICLES_COUNT })
    await loadRandomTopics({ amount: RANDOM_TOPICS_COUNT })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap class={styles.mainContent}>
      <Show when={isLoaded()} fallback={<Loading />}>
        <HomeView randomTopics={props.randomTopics} shouts={props.shouts || []} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default HomePage
