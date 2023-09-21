import { createEffect, JSX, Show } from 'solid-js'
import { useSession } from '../../context/session'
import { hideModal, showModal } from '../../stores/ui'
import styles from './AuthWrapper.module.scss'
import { useLocalize } from '../../context/localize'
import { Button } from '../_shared/Button'

type Props = {
  children: JSX.Element
}

export const AuthWrapper = (props: Props) => {
  const { t } = useLocalize()
  const { isAuthenticated, isSessionLoaded } = useSession()

  return (
    <Show when={isSessionLoaded()}>
      <Show
        fallback={
          <div class={styles.AuthWrapper}>
            <h3>{t("Let's log in")}</h3>
            <Button variant="primary" value={t('Enter')} size="L" onClick={() => showModal('auth')} />
          </div>
        }
        when={isAuthenticated()}
      >
        {props.children}
      </Show>
    </Show>
  )
}
