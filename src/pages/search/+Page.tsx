import type { PageProps } from '../../utils/types'

import { Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'

import { SearchView } from '../../components/Views/Search'
import { Loading } from '../../components/_shared/Loading'
import { PageLayout } from '../../components/_shared/PageLayout'
import { useLocalize } from '../../context/localize'
import { ReactionsProvider } from '../../context/reactions'
import { useRouter } from '../../stores/router'
import { loadShoutsSearch, resetSortedArticles } from '../../stores/zine/articles'

export const SearchPage = (props: PageProps) => {
  const [isLoaded, setIsLoaded] = createSignal(Boolean(props.searchResults))
  const { t } = useLocalize()
  const { page } = useRouter()
  const q = createMemo(() => page().params['q'] as string)

  createEffect(async () => {
    if (isLoaded()) return
    if (q() && window) {
      const text = q() || window.location.href.split('/').pop()
      // TODO: pagination, load more
      await loadShoutsSearch({ text, limit: 50, offset: 0 })
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
