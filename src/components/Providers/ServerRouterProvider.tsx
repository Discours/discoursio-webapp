import { isServer } from 'solid-js/web'
import { initRouter } from '../../stores/router'

type ServerRouterProps = {
  pathname: string
  search: string
  children: any
}

export const ServerRouterProvider = (props: ServerRouterProps) => {
  if (isServer) {
    initRouter(props.pathname, props.search)
  }

  return props.children
}
