import type { JSX } from 'solid-js'
import { Show } from 'solid-js'
import { useSession } from '../../context/session'

type ShowIfAuthenticatedProps = {
  children: JSX.Element
  fallback?: JSX.Element
}

export const ShowIfAuthenticated = (props: ShowIfAuthenticatedProps) => {
  const { isAuthenticated } = useSession()

  return (
    <Show when={isAuthenticated()} fallback={props.fallback}>
      {props.children}
    </Show>
  )
}
