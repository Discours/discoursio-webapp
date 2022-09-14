import type { Author } from '../../graphql/types.gen'
import Userpic from '../Author/Userpic'
import Icon from './Icon'
import './Private.scss'
import { session as sesstore } from '../../stores/auth'
import { useStore } from '@nanostores/solid'
import { router } from '../../stores/router'

export default () => {
  const session = useStore(sesstore)
  const routing = useStore(router)
  return (
    <div class="usercontrol col">
      <div class="usercontrol__item usercontrol__item--write-post">
        <a href="/create">
          <span class="text-label">опубликовать материал</span>
          <Icon name="pencil" />
        </a>
      </div>
      <div class="usercontrol__item usercontrol__item--search">
        <a href="/search">
          <Icon name="search" />
        </a>
      </div>
      <div class="usercontrol__item usercontrol__item--inbox">
        <a href="/inbox">
          <div classList={{ entered: routing().path === '/inbox' }}>
            <Icon name="inbox-white" counter={session().info?.unread || 0} />
          </div>
        </a>
      </div>
      <div class="usercontrol__item">
        <a href={`/${session().user?.slug}`}>
          <div classList={{ entered: routing().path === `/${session().user?.slug}` }}>
            <Userpic user={session().user as Author} />
          </div>
        </a>
      </div>
    </div>
  )
}
