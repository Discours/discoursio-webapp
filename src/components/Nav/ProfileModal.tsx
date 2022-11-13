import { AuthorCard } from '../Author/Card'
import type { Author } from '../../graphql/types.gen'
import { t } from '../../utils/intl'
import { hideModal } from '../../stores/ui'
import { createMemo, For } from 'solid-js'
import { useAuth } from '../../context/auth'

export const ProfileModal = () => {
  const {
    session,
    actions: { signOut }
  } = useAuth()

  const quit = () => {
    signOut()
    hideModal()
  }

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
