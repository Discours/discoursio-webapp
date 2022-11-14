import styles from './Header.module.scss'
import { clsx } from 'clsx'
import { handleClientRouteLinkClick, useRouter } from '../../stores/router'
import { t } from '../../utils/intl'
import { Icon } from './Icon'
import { createSignal, onMount, Show } from 'solid-js'
import Notifications from './Notifications'
import { ProfilePopup } from './ProfilePopup'
import Userpic from '../Author/Userpic'
import type { Author } from '../../graphql/types.gen'
import { showModal, useWarningsStore } from '../../stores/ui'
import { ClientContainer } from '../_shared/ClientContainer'
import { useSession } from '../../context/session'

type HeaderAuthProps = {
  setIsProfilePopupVisible: (value: boolean) => void
}

export const HeaderAuth = (props: HeaderAuthProps) => {
  const { page } = useRouter()
  const [visibleWarnings, setVisibleWarnings] = createSignal(false)
  const { warnings } = useWarningsStore()

  const { session, isAuthenticated } = useSession()

  const toggleWarnings = () => setVisibleWarnings(!visibleWarnings())

  const handleBellIconClick = (event: Event) => {
    event.preventDefault()

    if (!isAuthenticated()) {
      showModal('auth')
      return
    }

    toggleWarnings()
  }

  return (
    <ClientContainer>
      <Show when={!session.loading}>
        <div class={styles.usernav}>
          <div class={clsx(styles.userControl, styles.userControl, 'col')}>
            <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
              <a href="/create" onClick={handleClientRouteLinkClick}>
                <span class={styles.textLabel}>{t('Create post')}</span>
                <Icon name="pencil" class={styles.icon} />
              </a>
            </div>

            <Show when={isAuthenticated()}>
              <div class={styles.userControlItem}>
                <a href="#" onClick={handleBellIconClick}>
                  <div>
                    <Icon name="bell-white" counter={isAuthenticated() ? warnings().length : 1} />
                  </div>
                </a>
              </div>
            </Show>

            <Show when={visibleWarnings()}>
              <div class={clsx(styles.userControlItem, 'notifications')}>
                <Notifications />
              </div>
            </Show>

            <Show
              when={isAuthenticated()}
              fallback={
                <div class={clsx(styles.userControlItem, styles.userControlItemVerbose, 'loginbtn')}>
                  <a href="?modal=auth&mode=login" onClick={handleClientRouteLinkClick}>
                    <span class={styles.textLabel}>{t('Enter')}</span>
                    <Icon name="user-anonymous" class={styles.icon} />
                  </a>
                </div>
              }
            >
              <div class={clsx(styles.userControlItem, styles.userControlItemInbox)}>
                <a href="/inbox">
                  {/*FIXME: replace with route*/}
                  <div classList={{ entered: page().path === '/inbox' }}>
                    <Icon name="inbox-white" counter={session()?.news?.unread || 0} />
                  </div>
                </a>
              </div>
              <ProfilePopup
                onVisibilityChange={(isVisible) => {
                  props.setIsProfilePopupVisible(isVisible)
                }}
                containerCssClass={styles.control}
                trigger={
                  <div class={styles.userControlItem}>
                    <button class={styles.button}>
                      <div classList={{ entered: page().path === `/${session().user?.slug}` }}>
                        <Userpic user={session().user as Author} class={styles.userpic} />
                      </div>
                    </button>
                  </div>
                }
              />
            </Show>
          </div>
        </div>
      </Show>
    </ClientContainer>
  )
}
