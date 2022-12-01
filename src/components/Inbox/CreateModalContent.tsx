import { createSignal, For, createEffect } from 'solid-js'
import styles from './CreateModalContent.module.scss'
import { t } from '../../utils/intl'
import InviteUser from './InviteUser'
import type { Author } from '../../graphql/types.gen'
import { hideModal } from '../../stores/ui'
import { useInbox } from '../../context/inbox'

type inviteUser = Author & { selected: boolean }
type query =
  | {
      theme: string
      members: string[]
    }
  | undefined
type Props = {
  users: Author[]
}

const CreateModalContent = (props: Props) => {
  const inviteUsers: inviteUser[] = props.users.map((user) => ({ ...user, selected: false }))
  const [theme, setTheme] = createSignal<string>('')
  const [slugs, setSlugs] = createSignal<number[]>([])
  const [collectionToInvite, setCollectionToInvite] = createSignal<inviteUser[]>(inviteUsers)
  let textInput: HTMLInputElement

  const reset = () => {
    setTheme('')
    setSlugs([])
    hideModal()
  }

  createEffect(() => {
    setSlugs(() => {
      return collectionToInvite()
        .filter((user) => {
          return user.selected === true
        })
        .map((user) => {
          return user.id
        })
    })
    if (slugs().length > 2 && theme().length === 0) {
      setTheme(t('group_chat'))
    }
  })

  const handleSetTheme = () => {
    setTheme(textInput.value.length > 0 && textInput.value)
  }

  const handleClick = (user) => {
    setCollectionToInvite((userCollection) => {
      return userCollection.map((clickedUser) =>
        user.slug === clickedUser.slug ? { ...clickedUser, selected: !clickedUser.selected } : clickedUser
      )
    })
  }

  const { chatEntities, actions } = useInbox()

  console.log('!!! chatEntities:', chatEntities)

  const handleCreate = async () => {
    try {
      const initChat = await actions.createChat(slugs(), theme())
      console.debug('[initChat]', initChat)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div class={styles.CreateModalContent}>
      <h4>{t('create_chat')}</h4>
      {slugs().length > 2 && (
        <input
          ref={textInput}
          onInput={handleSetTheme}
          type="text"
          required={true}
          class="form-control form-control-lg fs-3"
          placeholder={t('discourse_theme')}
        />
      )}

      <div class="invite-recipients" style={{ height: '400px', overflow: 'auto' }}>
        <For each={collectionToInvite()}>
          {(author) => (
            <InviteUser onClick={() => handleClick(author)} author={author} selected={author.selected} />
          )}
        </For>
      </div>

      <div class={styles.footer}>
        <button type="button" class="btn btn-lg fs-3 btn-outline-danger" onClick={reset}>
          {t('cancel')}
        </button>
        <button
          type="button"
          class="btn btn-lg fs-3 btn-outline-primary"
          onClick={handleCreate}
          disabled={slugs().length === 0}
        >
          {slugs().length > 2 ? t('create_group') : t('create_chat')}
        </button>
      </div>
    </div>
  )
}

export default CreateModalContent
