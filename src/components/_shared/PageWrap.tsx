import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import '../../styles/app.scss'
import { Show } from 'solid-js'
import { clsx } from 'clsx'

type PageWrapProps = {
  headerTitle?: string
  children: JSX.Element
  isHeaderFixed?: boolean
  hideFooter?: boolean
  class?: string
}

export const PageWrap = (props: PageWrapProps) => {
  const isHeaderFixed = props.isHeaderFixed === undefined ? true : props.isHeaderFixed

  return (
    <>
      <Header title={props.headerTitle} isHeaderFixed={isHeaderFixed} />
      <main
        class={clsx('main-content', props.class)}
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
