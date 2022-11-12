import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import '../../styles/app.scss'
import { Show } from 'solid-js'

type MainWrapProps = {
  headerTitle?: string
  children: JSX.Element
  isHeaderFixed?: boolean
  hideFooter?: boolean
}

export const MainWrap = (props: MainWrapProps) => {
  const isHeaderFixed = props.isHeaderFixed !== undefined ? props.isHeaderFixed : true

  return (
    <>
      <Header title={props.headerTitle} isHeaderFixed={isHeaderFixed} />
      <main class="main-content" classList={{ 'main-content--no-padding': !isHeaderFixed }}>
        {props.children}
      </main>
      <Show when={props.hideFooter !== true}>
        <Footer />
      </Show>
    </>
  )
}
