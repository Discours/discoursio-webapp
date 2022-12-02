import { createSignal, For, createEffect } from 'solid-js'
import styles from './CreateModalContent.module.scss'
import { t } from '../../utils/intl'
import InviteUser from './InviteUser'
import type { Author } from '../../graphql/types.gen'
import { hideModal } from '../../stores/ui'
import { useInbox } from '../../context/inbox'

type InvitingUser = Author & {
  selected: boolean
}

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
  const inviteUsers: InvitingUser[] = props.users.map((user) => ({ ...user, selected: false }))
  const [title, setTitle] = createSignal<string>('')
  const [uids, setUids] = createSignal<number[]>([])
  const [collectionToInvite, setCollectionToInvite] = createSignal<InvitingUser[]>(inviteUsers)
  let textInput: HTMLInputElement

  const reset = () => {
    setTitle('')
    setUids([])
    hideModal()
  }

  createEffect(() => {
    console.log(collectionToInvite())
    setUids(() => {
      return collectionToInvite()
        .filter((user: InvitingUser) => {
          return user.selected === true
        })
        .map((user: InvitingUser) => {
          return user.id
        })
    })
    if (uids().length > 1 && title().length === 0) {
      setTitle(t('group_chat'))
    }
  })

  const handleSetTheme = () => {
    setTitle(textInput.value.length > 0 && textInput.value)
  }

  const handleClick = (user) => {
    setCollectionToInvite((userCollection: InvitingUser[]) => {
      return userCollection.map((clickedUser: InvitingUser) =>
        user.slug === clickedUser.slug ? { ...clickedUser, selected: !clickedUser.selected } : clickedUser
      )
    })
  }

  const { chatEntities, actions } = useInbox()

  console.log('!!! chatEntities:', chatEntities)

  const handleCreate = async () => {
    try {
      const initChat = await actions.createChat(uids(), title())
      console.debug('[initChat]', initChat)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div class={styles.CreateModalContent}>
      <h4>{t('create_chat')}</h4>
      {uids().length > 1 && (
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
          {(author: InvitingUser) => (
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
          disabled={uids().length === 0}
        >
          {uids().length > 1 ? t('create_group') : t('create_chat')}
        </button>
      </div>
    </div>
  )
}

export default CreateModalContent
