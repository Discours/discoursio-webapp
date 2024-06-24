import { clsx } from 'clsx'

import { ROUTES } from '../../../config/routes'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'

import { A, useMatch } from '@solidjs/router'
import { createMemo } from 'solid-js'
import styles from './Header.module.scss'

type Props = {
  onMouseOver: (event?: MouseEvent, time?: number) => void
  onMouseOut: (event?: MouseEvent, time?: number) => void
  routeName?: keyof typeof ROUTES
  body: string
  active?: boolean
  onClick?: (event: MouseEvent) => void
}

export const Link = (props: Props) => {
  const matchRoute = useMatch(() => props.routeName || '')
  const isSelected = createMemo(() => Boolean(matchRoute()))
  return (
    <li onClick={props.onClick} classList={{ 'view-switcher__item--selected': isSelected() }}>
      <ConditionalWrapper
        condition={!isSelected && Boolean(props.routeName)}
        wrapper={(children) => <A href={props.routeName || ''}>{children}</A>}
      >
        <span
          class={clsx('cursorPointer linkReplacement', { [styles.mainNavigationItemActive]: props.active })}
          onMouseOver={props.onMouseOver}
          onMouseOut={props.onMouseOut}
        >
          {props.body}
        </span>
      </ConditionalWrapper>
    </li>
  )
}
