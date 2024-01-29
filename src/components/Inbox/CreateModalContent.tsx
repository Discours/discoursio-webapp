import type { Author } from '../../graphql/schema/core.gen'

import { createSignal, For, createEffect, createMemo, onMount } from 'solid-js'

import { useInbox } from '../../context/inbox'
import { useLocalize } from '../../context/localize'
import { hideModal } from '../../stores/ui'

import InviteUser from './InviteUser'

import styles from './CreateModalContent.module.scss'

type InvitedAuthor = Author & { selected: boolean }
type Props = {
  users: Author[]
}

const CreateModalContent = (props: Props) => {
  const { t } = useLocalize()
  const inviteUsers = createMemo(() => props.users.map((user) => ({ ...user, selected: false })))
  const [chatTitle, setChatTitle] = createSignal<string>('')
  const [usersId, setUsersId] = createSignal<number[]>([])
  const [collectionToInvite, setCollectionToInvite] = createSignal<InvitedAuthor[]>([])
  let textInput: HTMLInputElement
  onMount(() => {
    setCollectionToInvite(inviteUsers())
  })
  const reset = () => {
    setChatTitle('')
    setUsersId([])
    hideModal()
  }

  createEffect(() => {
    setUsersId(() => {
      const s = collectionToInvite()
        .filter((user) => {
          return user.selected === true
        })
        .map((user) => {
          return user['id']
        })
      return [...s]
    })
  })

  const handleSetTheme = () => {
    setChatTitle(textInput.value.length > 0 && textInput.value)
  }

  const handleClick = (user) => {
    setCollectionToInvite((userCollection) => {
      return userCollection.map((clickedUser) =>
        user.id === clickedUser.id ? { ...clickedUser, selected: !clickedUser.selected } : clickedUser,
      )
    })
  }

  const { actions } = useInbox()

  const handleCreate = async () => {
    try {
      const initChat = await actions.createChat(usersId(), chatTitle())
      console.debug('[components.Inbox] create chat result:', initChat)
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
          {t('Cancel')}
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
