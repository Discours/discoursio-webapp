import { isServer } from 'solid-js/web'
import { router } from '../../stores/router'

type Props = {
  href: string
  children: any
}

export const ServerRouterProvider = (props: Props) => {
  if (isServer) {
    router.open(props.href)
  }

  return props.children
}
