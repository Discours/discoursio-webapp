import { For } from 'solid-js/web'
import { AuthorCard } from '../Author/Card'
import type { Author } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { hideModal } from '../../stores/ui'
import { session, signOut } from '../../stores/auth'
import { useStore } from '@nanostores/solid'
import { createMemo } from 'solid-js'

const quit = () => {
  signOut()
  hideModal()
}

export default () => {
  const auth = useStore(session)
  const author = createMemo(() => {
    const a = {
      name: 'anonymous',
      userpic: '',
      slug: ''
    } as Author
    if (auth()?.user?.slug) {
      const u = auth().user
      a.name = u.name
      a.slug = u.slug
      a.userpic = u.userpic
    }
    return a
  })

  // TODO: ProfileModal markup and styles
  return (
    <div class="row view profile">
      <h1>{auth()?.user?.username}</h1>
      <AuthorCard author={author()} />
      <div class="profile-bio">{auth()?.user?.bio || ''}</div>
      <For each={auth()?.user?.links || []}>{(l: string) => <a href={l}>{l}</a>}</For>
      <span onClick={quit}>{t('Quit')}</span>
    </div>
  )
}
