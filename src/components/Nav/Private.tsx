import type { Author } from '../../graphql/types.gen'
import Userpic from '../Author/Userpic'
import { Icon } from './Icon'
import './Private.module.scss'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from '../../stores/router'

export default () => {
  const { session } = useAuthStore()
  const { getPage } = useRouter()

  return (
    <div class="userControl col">
      <div class="userControlItem userControlItemWritePost">
        <a href="/create">
          <span class="text-label">опубликовать материал</span>
          <Icon name="pencil" />
        </a>
      </div>
      <div class="userControlItem userControlItemSearch">
        <a href="/search">
          <Icon name="search" />
        </a>
      </div>
      <div class="userControlItem userControlItemInbox">
        <a href="/inbox">
          {/*FIXME: replace with route*/}
          <div classList={{ entered: getPage().path === '/inbox' }}>
            <Icon name="inbox-white" counter={session().info?.unread || 0} />
          </div>
        </a>
      </div>
      <div class="userControlItem">
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
