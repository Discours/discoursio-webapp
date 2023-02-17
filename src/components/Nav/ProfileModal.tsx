import { AuthorCard } from '../Author/Card'
import type { Author } from '../../graphql/types.gen'

import { translit } from '../../utils/ru2en'
import { hideModal } from '../../stores/ui'
import { createMemo, For } from 'solid-js'
import { useSession } from '../../context/session'
import { useLocalize } from '../../context/localize'

export const ProfileModal = () => {
  const {
    session,
    actions: { signOut }
  } = useSession()

  const quit = () => {
    signOut()
    hideModal()
  }
  const { t, lang } = useLocalize()

  const author = createMemo<Author>(() => {
    const a: Author = {
      id: null,
      name: 'anonymous',
      userpic: '',
      slug: ''
    }

    if (session()?.user?.slug) {
      const u = session().user
      a.name = lang() === 'ru' ? u.name : translit(u.name)
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
