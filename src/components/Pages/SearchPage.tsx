import { PageWrap } from '../_shared/PageWrap'
import { SearchView } from '../Views/Search'
import type { PageProps } from '../types'
import { createMemo, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { loadSearchResults, resetSortedArticles } from '../../stores/zine/articles'
import { useRouter } from '../../stores/router'
import { Loading } from '../Loading'

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

    await loadSearchResults({ query: q(), limit: 50, offset: 0 })
    setIsLoaded(true)
  })

  onCleanup(() => resetSortedArticles())

  return (
    <PageWrap>
      <Show when={isLoaded()} fallback={<Loading />}>
        <SearchView results={props.searchResults || []} query={props.searchQuery} />
      </Show>
    </PageWrap>
  )
}

// for lazy loading
export default SearchPage
