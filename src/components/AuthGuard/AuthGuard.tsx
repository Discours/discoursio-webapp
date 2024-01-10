import { createEffect, JSX, Show } from 'solid-js'

import { useSession } from '../../context/session'
import { RootSearchParams } from '../../pages/types'
import { useRouter } from '../../stores/router'
import { hideModal } from '../../stores/ui'
import { AuthModalSearchParams } from '../Nav/AuthModal/types'

type Props = {
  children: JSX.Element
  disabled?: boolean
}

export const AuthGuard = (props: Props) => {
  const {
    isAuthenticated,
    isSessionLoaded,
    actions: { loadSession },
  } = useSession()
  const { changeSearchParams } = useRouter<RootSearchParams & AuthModalSearchParams>()

  createEffect(async () => {
    if (props.disabled) {
      return
    }
    if (isSessionLoaded()) {
      if (isAuthenticated()) {
        hideModal()
      } else {
        changeSearchParams(
          {
            source: 'authguard',
            modal: 'auth',
          },
          true,
        )
      }
    } else {
      await loadSession()
    }
  })

  return <Show when={(isSessionLoaded() && isAuthenticated()) || props.disabled}>{props.children}</Show>
}
