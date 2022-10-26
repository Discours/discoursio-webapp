import type { Author } from '../../graphql/types.gen'
import Userpic from '../Author/Userpic'
import { ProfilePopup } from './ProfilePopup'
import { Icon } from './Icon'
import styles from './Private.module.scss'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from '../../stores/router'
import { clsx } from 'clsx'
import { createSignal } from 'solid-js'

export default () => {
  const { session } = useAuthStore()
  const { page } = useRouter()
  const [isProfilePopupVisible, setIsProfilePopupVisible] = createSignal(false)

  return (
    <div class={clsx(styles.userControl, 'col')}>
      <div class={clsx(styles.userControlItem, styles.userControlItemWritePost)}>
        <a href="/create">
          <span class={styles.textLabel}>опубликовать материал</span>
          <Icon name="pencil" class={styles.icon} />
        </a>
      </div>
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
          setIsProfilePopupVisible(isVisible)
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
    </div>
  )
}
