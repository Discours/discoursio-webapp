import type { JSX } from 'solid-js/jsx-runtime'
import type { Config } from '../store/context'
import '../styles/Layout.scss'

export type Styled = {
  children: JSX.Element
  config?: Config
  'data-testid'?: string
  onClick?: () => void
  onMouseEnter?: (e: MouseEvent) => void
}

export const Layout = (props: Styled) => {
  return (
    <div onMouseEnter={props.onMouseEnter} class="layout container" data-testid={props['data-testid']}>
      {props.children}
    </div>
  )
}
