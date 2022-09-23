import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import '../../styles/app.scss'

type Props = {
  headerTitle?: string
  children: JSX.Element
  isHeaderFixed?: boolean
}

export const MainLayout = (props: Props) => {
  const isHeaderFixed = props.isHeaderFixed !== undefined ? props.isHeaderFixed : true

  return (
    <>
      <Header title={props.headerTitle} isHeaderFixed={isHeaderFixed} />
      <main class="main-content">{props.children}</main>
      <Footer />
    </>
  )
}
