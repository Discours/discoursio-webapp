import type { Config } from './store'
import './Layout.scss'

export type Styled = {
  children: any
  config?: Config
  'data-testid'?: string
  onClick?: () => void
  onMouseEnter?: (e: any) => void
}

export const Layout = (props: Styled) => {
  return (
    // eslint-disable-next-line solid/reactivity
    <div onMouseEnter={props.onMouseEnter} class="layout layout--editor" data-testid={props['data-testid']}>
      {props.children}
    </div>
  )
}
