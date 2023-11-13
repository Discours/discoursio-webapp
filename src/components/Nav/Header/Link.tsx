import styles from './Header.module.scss'
import { router, ROUTES, useRouter } from '../../../stores/router'
import { clsx } from 'clsx'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { getPagePath } from '@nanostores/router'

type Props = {
  onMouseOver: (event?: MouseEvent, time?: number) => void
  onMouseOut: (event?: MouseEvent, time?: number) => void
  routeName?: keyof typeof ROUTES
  body: string
  active?: boolean
  onClick?: (event: MouseEvent) => void
}

export const Link = (props: Props) => {
  const { page } = useRouter()
  const isSelected = page().route === props.routeName
  return (
    <li
      onClick={props.onClick}
      classList={{ 'view-switcher__item--selected': page().route === props.routeName }}
    >
      <ConditionalWrapper
        condition={!isSelected && Boolean(props.routeName)}
        wrapper={(children) => <a href={getPagePath(router, props.routeName)}>{children}</a>}
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
