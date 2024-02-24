import { JSX, Show, createEffect } from 'solid-js'

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
  const { isAuthenticated, isSessionLoaded } = useSession()
  const { changeSearchParams } = useRouter<RootSearchParams & AuthModalSearchParams>()

  createEffect(() => {
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
            m: 'auth'
          },
          true
        )
      }
    } else {
      // await loadSession()
      console.warn('session is not loaded')
    }
  })

  return <Show when={(isSessionLoaded() && isAuthenticated()) || props.disabled}>{props.children}</Show>
}
