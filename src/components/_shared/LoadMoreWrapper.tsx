import { JSX, Show, createEffect, createSignal, on, onMount } from 'solid-js'
import { Button } from '~/components/_shared/Button'
import { useLocalize } from '~/context/localize'
import { Author, Reaction, Shout } from '~/graphql/schema/core.gen'
import { SortFunction } from '~/types/common'
import { restoreScrollPosition, saveScrollPosition } from '~/utils/scroll'
import { byCreated } from '~/utils/sort'

import styles from './LoadMoreWrapper.module.scss'

export type LoadMoreItems = Shout[] | Author[] | Reaction[]

type LoadMoreProps = {
  loadFunction: (offset: number) => Promise<LoadMoreItems | undefined>
  pageSize: number
  hidden?: boolean
  children: JSX.Element
}

export const LoadMoreWrapper = (props: LoadMoreProps) => {
  const { t } = useLocalize()
  const [items, setItems] = createSignal<LoadMoreItems>([])
  const [offset, setOffset] = createSignal(0)
  const [isLoadMoreButtonVisible, setIsLoadMoreButtonVisible] = createSignal(props.hidden)
  const [isLoading, setIsLoading] = createSignal(false)

  createEffect(
    on(items, (iii) => {
      // console.debug('LoadMoreWrapper.fx:', iii)
      if (Array.isArray(iii)) {
        setIsLoadMoreButtonVisible(iii.length - offset() >= 0)
        setOffset(iii.length)
      }
    })
  )

  const loadItems = async () => {
    // console.debug('LoadMoreWrapper.loadItems offset:', offset())
    setIsLoading(true)
    saveScrollPosition()
    const newItems = await props.loadFunction(offset())
    if (!Array.isArray(newItems)) return
    if (newItems.length === 0) setIsLoadMoreButtonVisible(false)
    else
      setItems(
        (prev) =>
          Array.from(new Set([...prev, ...newItems])).sort(
            byCreated as SortFunction<unknown>
          ) as LoadMoreItems
      )
    setIsLoading(false)
    restoreScrollPosition()
    // console.debug('LoadMoreWrapper.loadItems loaded:', newItems.length)
  }

  onMount(loadItems)

  return (
    <>
      {props.children}
      <div>
        <Show when={isLoadMoreButtonVisible() && !props.hidden}>
          <div class={styles.loadMoreWrapper}>
            <Button
              onClick={loadItems}
              disabled={isLoading()}
              value={t('Load more')}
              title={`${items().length} ${t('loaded')}`}
            />
          </div>
        </Show>
      </div>
    </>
  )
}
