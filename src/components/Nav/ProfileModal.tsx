import { AuthorCard } from '../Author/Card'
import type { Author } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { hideModal } from '../../stores/ui'
import { useAuthStore, signOut } from '../../stores/auth'
import { createMemo, For } from 'solid-js'

const quit = () => {
  signOut()
  hideModal()
}

export default () => {
  const { session } = useAuthStore()

  const author = createMemo<Author>(() => {
    const a: Author = {
      id: null,
      name: 'anonymous',
      userpic: '',
      slug: ''
    }

    if (session()?.user?.slug) {
      const u = session().user
      a.name = u.name
      a.slug = u.slug
      a.userpic = u.userpic
    }

    return a
  })

  // TODO: ProfileModal markup and styles
  return (
    <div class="row view profile">
      <h1>{session()?.user?.username}</h1>
      <AuthorCard author={author()} />
      <div class="profile-bio">{session()?.user?.bio || ''}</div>
      <For each={session()?.user?.links || []}>{(l: string) => <a href={l}>{l}</a>}</For>
      <span onClick={quit}>{t('Quit')}</span>
    </div>
  )
}
