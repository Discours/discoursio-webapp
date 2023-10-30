import { createSignal, onCleanup, createEffect, For, JSXElement } from 'solid-js'
import { clsx } from 'clsx'
import styles from './InfiniteScroll.module.scss'

type Props = {
  class?: string
  pageSize: number
  callbackOnEnd: () => void
  children: JSXElement
}

export const InfiniteScroll = (props: Props) => {
  const containerRef: { current: HTMLDivElement } = { current: null }
  const [isLoading, setIsLoading] = createSignal(false)

  const checkIfNearBottom = () => {
    if (containerRef.current) {
      const isNearBottom =
        containerRef.current.scrollHeight - containerRef.current.scrollTop <=
        containerRef.current.clientHeight * 1.5
      if (isNearBottom && !isLoading()) {
        setIsLoading(true)
        props.callbackOnEnd()
      }
    }
  }

  // createEffect(() => {
  //   if (props.elements.length > 0) {
  //     setIsLoading(false)
  //   }
  // })

  createEffect(() => {
    if (!containerRef.current) {
      return
    }
    containerRef.current.addEventListener('scroll', checkIfNearBottom)

    onCleanup(() => {
      containerRef.current.removeEventListener('scroll', checkIfNearBottom)
    })
  })

  return (
    <div ref={(el) => (containerRef.current = el)} class={clsx(styles.InfiniteScroll, props.class)}>
      {props.children}
      {isLoading() && <div>Loading more items...</div>}
    </div>
  )
}
