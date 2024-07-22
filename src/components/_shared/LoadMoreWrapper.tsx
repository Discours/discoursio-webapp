import { JSX, Show, createEffect, createSignal, on, onMount } from 'solid-js'
import { Button } from '~/components/_shared/Button'
import { useLocalize } from '~/context/localize'
import { Author, Reaction, Shout } from '~/graphql/schema/core.gen'
import { byCreated } from '~/lib/sort'
import { SortFunction } from '~/types/common'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import { Loading } from './Loading'

export type LoadMoreItems = Shout[] | Author[] | Reaction[]

type LoadMoreProps = {
  loadFunction: (offset: number) => Promise<LoadMoreItems>
  pageSize: number
  hidden?: boolean
  children: JSX.Element
}

export const LoadMoreWrapper = (props: LoadMoreProps) => {
  const { t } = useLocalize()
  const [items, setItems] = createSignal<LoadMoreItems>([])
  const [offset, setOffset] = createSignal(0)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(false)
  const [isLoading, setIsLoading] = createSignal(false)

  createEffect(
    on(items, (iii) => {
      if (Array.isArray(iii)) {
        setIsLoadMoreButtonVisible(iii.length - offset() >= 0)
        setOffset(iii.length)
      }
    })
  )

  const loadItems = async () => {
    setIsLoading(true)
    saveScrollPosition()
    const newItems = await props.loadFunction(offset())
    if (!Array.isArray(newItems)) return
    console.debug('[_share] load more items', newItems)
    setItems(
      (prev) =>
        Array.from(new Set([...prev, ...newItems])).sort(
          byCreated as SortFunction<unknown>
        ) as LoadMoreItems
    )
    setIsLoading(false)
    restoreScrollPosition()
  }

  onMount(loadItems)

  return (
    <>
      {props.children}
      <Show when={isLoading()}>
        <Loading />
      </Show>
      <Show when={isLoadMoreButtonVisible() && !props.hidden && !isLoading()}>
        <div class="load-more-container">
          <Button onClick={loadItems} value={t('Load more')} title={`${items().length} ${t('loaded')}`} />
        </div>
      </Show>
    </>
  )
}
