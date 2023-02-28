import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { Title } from '@solidjs/meta'
import { HomeView, PRERENDERED_ARTICLES_COUNT, RANDOM_TOPICS_COUNT } from '../components/Views/Home'
import { PageLayout } from '../components/_shared/PageLayout'
import type { PageProps } from './types'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { loadRandomTopics } from '../stores/zine/topics'
import { Loading } from '../components/_shared/Loading'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'

export const HomePage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.homeShouts) && Boolean(props.randomTopics))
  const { t } = useLocalize()

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
    <PageLayout withPadding={true}>
      <ReactionsProvider>
        <Title>{t('Discours')}</Title>
        <Show when={isLoaded()} fallback={<Loading />}>
          <HomeView randomTopics={props.randomTopics} shouts={props.homeShouts || []} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = HomePage
