import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import { Show } from 'solid-js'
import { clsx } from 'clsx'
import '../../styles/app.scss'
import styles from './PageLayout.module.scss'

type PageLayoutProps = {
  headerTitle?: string
  articleBody?: string
  cover?: string
  children: JSX.Element
  isHeaderFixed?: boolean
  hideFooter?: boolean
  class?: string
  withPadding?: boolean
}

export const PageLayout = (props: PageLayoutProps) => {
  const isHeaderFixed = props.isHeaderFixed === undefined ? true : props.isHeaderFixed

  return (
    <>
      <Header
        title={props.headerTitle}
        articleBody={props.articleBody}
        cover={props.articleBody}
        isHeaderFixed={isHeaderFixed}
      />
      <main
        class={clsx('main-content', {
          [styles.withPadding]: props.withPadding
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
