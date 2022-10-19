import type { Author } from '../../graphql/types.gen'
import Userpic from '../Author/Userpic'
import { Icon } from './Icon'
import styles from './Private.module.scss'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from '../../stores/router'
import { clsx } from 'clsx'

export default () => {
  const { session } = useAuthStore()
  const { getPage } = useRouter()

  return (
    <div class={clsx(styles.userControl, 'col')}>
      <div class={clsx(styles.userControlItem, styles.userControlItemWritePost)}>
        <a href="/create">
          <span class={styles.textLabel}>опубликовать материал</span>
          <Icon name="pencil" />
        </a>
      </div>
      <div class={clsx(styles.userControlItem, styles.userControlItemInbox)}>
        <a href="/inbox">
          {/*FIXME: replace with route*/}
          <div classList={{ entered: getPage().path === '/inbox' }}>
            <Icon name="inbox-white" counter={session()?.news?.unread || 0} />
          </div>
        </a>
      </div>
      <div class={styles.userControlItem}>
        <a href={`/${session().user?.slug}`}>
          {/*FIXME: replace with route*/}
          <div classList={{ entered: getPage().path === `/${session().user?.slug}` }}>
            <Userpic user={session().user as Author} />
          </div>
        </a>
      </div>
    </div>
  )
}
