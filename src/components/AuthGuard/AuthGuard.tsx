import { createEffect, JSX, Show } from 'solid-js'
import { useSession } from '../../context/session'
import { hideModal, showModal } from '../../stores/ui'

type Props = {
  children: JSX.Element
  disabled?: boolean
}

export const AuthGuard = (props: Props) => {
  const { isAuthenticated, isSessionLoaded } = useSession()

  createEffect(() => {
    if (props.disabled) {
      return
    }
    if (isSessionLoaded()) {
      if (isAuthenticated()) {
        hideModal()
      } else {
        showModal('auth', 'authguard')
      }
    }
  })

  return <Show when={(isSessionLoaded() && isAuthenticated()) || props.disabled}>{props.children}</Show>
}
