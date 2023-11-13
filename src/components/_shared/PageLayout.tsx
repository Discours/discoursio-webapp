import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import { createEffect, createSignal, Show } from 'solid-js'
import { clsx } from 'clsx'
import '../../styles/app.scss'
import styles from './PageLayout.module.scss'

type Props = {
  headerTitle?: string
  slug?: string
  articleBody?: string
  cover?: string
  children: JSX.Element
  isHeaderFixed?: boolean
  hideFooter?: boolean
  class?: string
  withPadding?: boolean
  zeroBottomPadding?: boolean
  scrollToComments?: (value: boolean) => void
}

export const PageLayout = (props: Props) => {
  const isHeaderFixed = props.isHeaderFixed === undefined ? true : props.isHeaderFixed
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)

  createEffect(() => {
    if (props.scrollToComments) {
      props.scrollToComments(scrollToComments())
    }
  })

  return (
    <>
      <Header
        slug={props.slug}
        title={props.headerTitle}
        articleBody={props.articleBody}
        cover={props.articleBody}
        isHeaderFixed={isHeaderFixed}
        scrollToComments={(value) => setScrollToComments(value)}
      />
      <main
        class={clsx('main-content', {
          [styles.withPadding]: props.withPadding,
          [styles.zeroBottomPadding]: props.zeroBottomPadding
        })}
        classList={{ 'main-content--no-padding': !isHeaderFixed }}
      >
        {props.children}
      </main>
      <Show when={props.hideFooter !== true}>
        <Footer />
      </Show>
    </>
  )
}
