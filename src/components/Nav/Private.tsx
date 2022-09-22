import type { Author } from '../../graphql/types.gen'
import Userpic from '../Author/Userpic'
import { Icon } from './Icon'
import './Private.scss'
import { session as sesstore } from '../../stores/auth'
import { useStore } from '@nanostores/solid'
import { useRouter } from '../../stores/router'

export default () => {
  const session = useStore(sesstore)
  const { getPage } = useRouter()

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
          {/*FIXME: replace with route*/}
          <div classList={{ entered: getPage().path === '/inbox' }}>
            <Icon name="inbox-white" counter={session().info?.unread || 0} />
          </div>
        </a>
      </div>
      <div class="usercontrol__item">
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
