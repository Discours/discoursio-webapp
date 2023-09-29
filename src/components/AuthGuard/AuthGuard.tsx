import { createEffect, JSX, Show } from 'solid-js'
import { useSession } from '../../context/session'
import { hideModal, showModal } from '../../stores/ui'
import { useRouter } from '../../stores/router'
import { RootSearchParams } from '../../pages/types'
import { AuthModalSearchParams } from '../Nav/AuthModal/types'

type Props = {
  children: JSX.Element
  disabled?: boolean
}

export const AuthGuard = (props: Props) => {
  const { isAuthenticated, isSessionLoaded } = useSession()
  const { changeSearchParam } = useRouter<RootSearchParams & AuthModalSearchParams>()

  createEffect(() => {
    if (props.disabled) {
      return
    }
    if (isSessionLoaded()) {
      if (isAuthenticated()) {
        hideModal()
      } else {
        changeSearchParam(
          {
            source: 'authguard',
            modal: 'auth'
          },
          true
        )
      }
    }
  })

  return <Show when={(isSessionLoaded() && isAuthenticated()) || props.disabled}>{props.children}</Show>
}
