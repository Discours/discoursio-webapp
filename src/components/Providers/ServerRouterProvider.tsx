import { isServer } from 'solid-js/web'
import { initRouter } from '../../stores/router'

type Props = {
  pathname: string
  search: string
  children: any
}

export const ServerRouterProvider = (props: Props) => {
  if (isServer) {
    initRouter(props.pathname, props.search)
  }

  return props.children
}
