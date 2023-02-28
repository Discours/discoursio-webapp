import { PageLayout } from '../components/_shared/PageLayout'
import { SearchView } from '../components/Views/Search'
import type { PageProps } from './types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { useRouter } from '../stores/router'
import { loadShouts, resetSortedArticles } from '../stores/zine/articles'
import { Loading } from '../components/_shared/Loading'
import { ReactionsProvider } from '../context/reactions'

export const SearchPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.searchResults))

  const q = createMemo(() => {
    const { page: getPage } = useRouter()

    const page = getPage()

    if (page.route !== 'search') {
      throw new Error('ts guard')
    }

    return page.params.q
  })

  onMount(async () => {
    if (isLoaded()) {
      return
    }

    await loadShouts({ filters: { title: q(), body: q() }, limit: 50, offset: 0 })
    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageLayout>
      <ReactionsProvider>
        <Show when={isLoaded()} fallback={<Loading />}>
          <SearchView results={props.searchResults || []} query={props.searchQuery} />
        </Show>
      </ReactionsProvider>
    </PageLayout>
  )
}

export const Page = SearchPage
