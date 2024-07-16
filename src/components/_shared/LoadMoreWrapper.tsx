import { JSX, Show, createSignal, onMount } from 'solid-js'
import { Button } from '~/components/_shared/Button'
import { useLocalize } from '~/context/localize'
import { Author, Reaction, Shout } from '~/graphql/schema/core.gen'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'

export type LoadMoreItems = Shout[] | Author[] | Reaction[]

type LoadMoreProps = {
  loadFunction: (offset?: number) => Promise<LoadMoreItems>
  pageSize: number
  hidden?: boolean
  children: JSX.Element
}

export const LoadMoreWrapper = (props: LoadMoreProps) => {
  const { t } = useLocalize()
  const [items, setItems] = createSignal<LoadMoreItems>([])
  const [offset, setOffset] = createSignal(0)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(true)
  const [isLoading, setIsLoading] = createSignal(false)

  const loadItems = async () => {
    setIsLoading(true)
    saveScrollPosition()
    const newItems = await props.loadFunction(offset())
    if (!Array.isArray(newItems)) return
    console.debug('[_share] load more items', newItems)
    setItems((prev) => [...prev, ...newItems] as LoadMoreItems)
    setOffset((prev) => prev + props.pageSize)
    setIsLoadMoreButtonVisible(newItems.length >= props.pageSize - 1)
    setIsLoading(false)
    restoreScrollPosition()
  }

  onMount(loadItems)

  return (
    <>
      {props.children}
      <Show when={isLoadMoreButtonVisible() && !props.hidden}>
        <div class="load-more-container">
          <Button
            onClick={loadItems}
            disabled={isLoading()}
            value={t('Load more')}
            title={`${items().length} ${t('loaded')}`}
          />
        </div>
      </Show>
    </>
  )
}
