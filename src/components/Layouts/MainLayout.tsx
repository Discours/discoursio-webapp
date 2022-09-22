import type { JSX } from 'solid-js'
import { Header } from '../Nav/Header'
import { Footer } from '../Discours/Footer'

import '../../styles/app.scss'

type Props = {
  headerTitle?: string
  children: JSX.Element
}

export const MainLayout = (props: Props) => {
  return (
    <>
      <Header title={props.headerTitle} />
      <main class="main-content">{props.children}</main>
      <Footer />
    </>
  )
}
