import { PageLayout } from '../components/_shared/PageLayout'
import { SearchView } from '../components/Views/Search'
import type { PageProps } from './types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { useRouter } from '../stores/router'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { Loading } from '../components/_shared/Loading'
import { ReactionsProvider } from '../context/reactions'
import { useLocalize } from '../context/localize'

export const SearchPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.searchResults))

  const { t } = useLocalize()

  const { page } = useRouter()

  const q = createMemo(() => page().params['q'] as string)

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadShouts({ filters: { title: q(), body: q() }, limit: 50, offset: 0 })
    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageLayout title={t('Search')}>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <SearchView results={props.searchResults || []} query={props.searchQuery} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = SearchPage
