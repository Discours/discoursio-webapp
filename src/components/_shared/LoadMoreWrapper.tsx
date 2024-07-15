import { JSX, Show, createSignal, onMount } from 'solid-js'
import { Button } from '~/components/_shared/Button'
import { useLocalize } from '~/context/localize'
import { Author, Reaction, Shout } from '~/graphql/schema/core.gen'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'

type LoadMoreProps = {
  loadFunction: (offset?: number) => void
  pageSize: number
  children: JSX.Element
}

type Items = Shout[] | Author[] | Reaction[]

export const LoadMoreWrapper = (props: LoadMoreProps) => {
  const { t } = useLocalize()
  const [items, setItems] = createSignal<Items>([])
  const [offset, setOffset] = createSignal(0)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(true)
  const [isLoading, setIsLoading] = createSignal(false)

  const loadItems = async () => {
    setIsLoading(true)
    saveScrollPosition()
    const newItems = await props.loadFunction(offset())
    if (!Array.isArray(newItems)) return
    setItems((prev) => [...prev, ...newItems])
    setOffset((prev) => prev + props.pageSize)
    setIsLoadMoreButtonVisible(newItems.length >= props.pageSize)
    setIsLoading(false)
    restoreScrollPosition()
  }

  onMount(loadItems)

  return (
    <>
      {props.children}
      <Show when={isLoadMoreButtonVisible()}>
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
