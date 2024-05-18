import type { PageProps } from './types'

import { Show, createSignal, onCleanup, onMount } from 'solid-js'

import { HomeView, PRERENDERED_ARTICLES_COUNT } from '../components/Views/Home'
import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'

export const HomePage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.homeShouts))
  const { t } = useLocalize()

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadShouts({ filters: { featured: true }, limit: PRERENDERED_ARTICLES_COUNT })

    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageLayout withPadding={true} title={t('Discours')}>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <HomeView shouts={props.homeShouts || []} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = HomePage
