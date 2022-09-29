import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import '../../styles/app.scss'
import { Show } from 'solid-js'

type MainLayoutProps = {
  headerTitle?: string
  children: JSX.Element
  isHeaderFixed?: boolean
  hideFooter?: boolean
}

export const MainLayout = (props: MainLayoutProps) => {
  return (
    <>
      <Header title={props.headerTitle} isHeaderFixed={props.isHeaderFixed === true} />
      <main class="main-content">{props.children}</main>
      <Show when={props.hideFooter !== true}>
        <Footer />
      </Show>
    </>
  )
}
