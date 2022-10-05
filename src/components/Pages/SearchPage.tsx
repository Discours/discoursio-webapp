import { MainLayout } from '../Layouts/MainLayout'
import { SearchView } from '../Views/Search'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadSearchResults, resetSortedArticles } from '../../stores/zine/articles'
import { t } from '../../utils/intl'
import { useRouter } from '../../stores/router'

export const SearchPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.searchResults))

  const q = createMemo(() => {
    const { getPage } = useRouter()

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

    await loadSearchResults({ query: q(), limit: 50, offset: 0 })
    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <MainLayout>
      <Show when={isLoaded()} fallback={t('Loading')}>
        <SearchView results={props.searchResults || []} query={props.searchQuery} />
      </Show>
    </MainLayout>
  )
}

// for lazy loading
export default SearchPage
