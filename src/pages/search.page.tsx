import type { PageProps } from './types'

import { createEffect, createMemo, createSignal, onCleanup, Show } from 'solid-js'

import { Loading } from '../components/_shared/Loading'
import { PageLayout } from '../components/_shared/PageLayout'
import { SearchView } from '../components/Views/Search'
import { useLocalize } from '../context/localize'
import { ReactionsProvider } from '../context/reactions'
import { useRouter } from '../stores/router'
import { loadShoutsSearch, resetSortedArticles } from '../stores/zine/articles'

export const SearchPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(true)
  const { t } = useLocalize()
  const { page } = useRouter()
  const q = createMemo(() => page().params['q'] as string)

  createEffect(() => {
    if (isLoaded()) return
    else if (q() && window) {
      const text = q() || window.location.pathname?.split('/').pop()
      loadShoutsSearch({ text, limit: 50, offset: 0 })
      setIsLoaded(true)
    }
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
