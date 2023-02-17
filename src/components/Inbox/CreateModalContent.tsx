import { createSignal, For, createEffect } from 'solid-js'
import styles from './CreateModalContent.module.scss'

import InviteUser from './InviteUser'
import type { Author } from '../../graphql/types.gen'
import { hideModal } from '../../stores/ui'
import { useInbox } from '../../context/inbox'
import { useLocalize } from '../../context/localize'

type inviteUser = Author & { selected: boolean }
type Props = {
  users: Author[]
}

const CreateModalContent = (props: Props) => {
  const { t } = useLocalize()
  const inviteUsers: inviteUser[] = props.users.map((user) => ({ ...user, selected: false }))
  const [theme, setTheme] = createSignal<string>(' ')
  const [usersId, setUsersId] = createSignal<number[]>([])
  const [collectionToInvite, setCollectionToInvite] = createSignal<inviteUser[]>(inviteUsers)
  let textInput: HTMLInputElement

  const reset = () => {
    setTheme('')
    setUsersId([])
    hideModal()
  }

  createEffect(() => {
    setUsersId(() => {
      return collectionToInvite()
        .filter((user) => {
          return user.selected === true
        })
        .map((user) => {
          return user['id']
        })
    })
    if (usersId().length > 1 && theme().length === 1) {
      setTheme(t('Group Chat'))
    }
  })

  const handleSetTheme = () => {
    setTheme(textInput.value.length > 0 && textInput.value)
  }

  const handleClick = (user) => {
    setCollectionToInvite((userCollection) => {
      return userCollection.map((clickedUser) =>
        user.id === clickedUser.id ? { ...clickedUser, selected: !clickedUser.selected } : clickedUser
      )
    })
  }

  const { actions } = useInbox()

  const handleCreate = async () => {
    try {
      const initChat = await actions.createChat(usersId(), theme())
      console.debug('[initChat]', initChat)
      hideModal()
      await actions.loadChats()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div class={styles.CreateModalContent}>
      <h4>{t('Create Chat')}</h4>
      {usersId().length > 1 && (
        <input
          ref={textInput}
          onInput={handleSetTheme}
          type="text"
          required={true}
          class="form-control form-control-lg fs-3"
          placeholder={t('Chat Title')}
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
          disabled={usersId().length === 0}
        >
          {usersId().length > 1 ? t('Create Group') : t('Create Chat')}
        </button>
      </div>
    </div>
  )
}

export default CreateModalContent
