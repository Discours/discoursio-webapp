import { For, createSignal, Show, onMount, createEffect, createMemo } from 'solid-js'
import type { Author, Chat } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import { Icon } from '../_shared/Icon'
import { Loading } from '../Loading'
import DialogCard from '../Inbox/DialogCard'
import Search from '../Inbox/Search'
import { useSession } from '../../context/session'
import { createClient } from '@urql/core'
import Message from '../Inbox/Message'
import { loadRecipients, loadMessages } from '../../stores/inbox'
import { t } from '../../utils/intl'
import { Modal } from '../Nav/Modal'
import { showModal } from '../../stores/ui'
import CreateModalContent from '../Inbox/CreateModalContent'
import { clsx } from 'clsx'
import '../../styles/Inbox.scss'
import { useInbox } from '../../context/inbox'
import DialogHeader from '../Inbox/DialogHeader'

const OWNER_ID = '501'
const client = createClient({
  url: 'https://graphqlzero.almansi.me/api'
})

const messageQuery = `
query Comments ($options: PageQueryOptions) {
  comments(options: $options) {
    data {
      id
      body
      email
    }
  }
}
`
const newMessageQuery = `
mutation postComment($messageBody: String!) {
  createComment(
    input: { body: $messageBody, email: "test@test.com", name: "User" }
  ) {
    id
    body
    name
    email
  }
}
`

const userSearch = (array: Author[], keyword: string) => {
  const searchTerm = keyword.toLowerCase()
  return array.filter((value) => {
    return value.name.toLowerCase().match(new RegExp(searchTerm, 'g'))
  })
}

const postMessage = async (msg: string) => {
  const response = await client.mutation(newMessageQuery, { messageBody: msg }).toPromise()
  return response.data.createComment
}

export const InboxView = () => {
  const {
    chats,
    actions: { loadChats }
  } = useInbox()
  const [messages, setMessages] = createSignal([])
  const [recipients, setRecipients] = createSignal<Author[]>([])
  const [cashedRecipients, setCashedRecipients] = createSignal<Author[]>([])
  const [postMessageText, setPostMessageText] = createSignal('')
  const [loading, setLoading] = createSignal<boolean>(false)
  const [sortByGroup, setSortByGroup] = createSignal<boolean>(false)
  const [sortByPerToPer, setSortByPerToPer] = createSignal<boolean>(false)
  const [selectedChat, setSelectedChat] = createSignal<Chat>()
  const { session } = useSession()
  const currentSlug = createMemo(() => session()?.user?.slug)

  // Поиск по диалогам
  const getQuery = (query) => {
    if (query().length >= 2) {
      const match = userSearch(recipients(), query())
      setRecipients(match)
    } else {
      setRecipients(cashedRecipients())
    }
  }

  let chatWindow
  const handleOpenChat = async (chat) => {
    setLoading(true)
    setSelectedChat(chat)
    try {
      await loadMessages({ chat: chat.id })
    } catch (error) {
      setLoading(false)
      console.error('[loadMessages]', error)
    } finally {
      setLoading(false)
      chatWindow.scrollTop = chatWindow.scrollHeight
    }
  }
  onMount(async () => {
    setLoading(true)
    try {
      const response = await loadRecipients({ days: 365 })
      setRecipients(response as unknown as Author[])
      setCashedRecipients(response as unknown as Author[])
    } catch (error) {
      console.log(error)
    }
    await loadChats()
    console.log('!!! chats:', chats())
  })

  const handleSubmit = async () => {
    try {
      const post = await postMessage(postMessageText())
      setMessages((prev) => [...prev, post])
      setPostMessageText('')
      chatWindow.scrollTop = chatWindow.scrollHeight
    } catch (error) {
      console.error('[post message error]:', error)
    }
  }

  let textareaParent // textarea autoresize ghost element
  const handleChangeMessage = (event) => {
    setPostMessageText(event.target.value)
  }
  createEffect(() => {
    textareaParent.dataset.replicatedValue = postMessageText()
  })

  const handleOpenInviteModal = (event: Event) => {
    event.preventDefault()
    showModal('inviteToChat')
  }

  const chatsToShow = () => {
    if (sortByPerToPer()) {
      return chats().filter((chat) => chat.title.trim().length === 0)
    } else if (sortByGroup()) {
      return chats().filter((chat) => chat.title.trim().length > 0)
    } else {
      return chats()
    }
  }

  return (
    <div class="messages container">
      <Modal variant="narrow" name="inviteToChat">
        <CreateModalContent users={recipients()} />
      </Modal>
      <div class="row">
        <div class="chat-list col-md-4">
          <div class="sidebar-header">
            <Search placeholder="Поиск" onChange={getQuery} />
            <div onClick={handleOpenInviteModal}>
              <Icon name="plus-button" style={{ width: '40px', height: '40px' }} />
            </div>
          </div>

          <div class="chat-list__types">
            <ul>
              <li
                class={clsx({ ['selected']: !sortByPerToPer() && !sortByGroup() })}
                onClick={() => {
                  setSortByPerToPer(false)
                  setSortByGroup(false)
                }}
              >
                <span>{t('All')}</span>
              </li>
              <li
                class={clsx({ ['selected']: sortByPerToPer() })}
                onClick={() => {
                  setSortByPerToPer(true)
                  setSortByGroup(false)
                }}
              >
                <span>{t('Personal')}</span>
              </li>
              <li
                class={clsx({ ['selected']: sortByGroup() })}
                onClick={() => {
                  setSortByGroup(true)
                  setSortByPerToPer(false)
                }}
              >
                <span>{t('Groups')}</span>
              </li>
            </ul>
          </div>
          <div class="holder">
            <div class="dialogs">
              <For each={chatsToShow()}>
                {(chat) => (
                  <DialogCard
                    onClick={() => handleOpenChat(chat)}
                    title={chat.title}
                    members={chat.members}
                    ownSlug={currentSlug()}
                  />
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="col-md-8 conversation">
          <Show when={selectedChat()}>
            <DialogHeader currentSlug={currentSlug()} chat={selectedChat()} />
          </Show>

          <div class="conversation__messages">
            <div class="conversation__messages-container" ref={chatWindow}>
              <Show when={loading()}>
                <Loading />
              </Show>
              <For each={messages()}>
                {(comment: { body: string; id: string; email: string }) => (
                  <Message body={comment.body} isOwn={OWNER_ID === comment.id} />
                )}
              </For>

              {/*<div class="conversation__date">*/}
              {/*  <time>12 сентября</time>*/}
              {/*</div>*/}
            </div>
          </div>

          <div class="message-form">
            <div class="wrapper">
              <div class="grow-wrap" ref={textareaParent}>
                <textarea
                  value={postMessageText()}
                  rows={1}
                  onInput={(event) => handleChangeMessage(event)}
                  placeholder="Написать сообщение"
                />
              </div>
              <button type="submit" disabled={postMessageText().length === 0} onClick={handleSubmit}>
                <Icon name="send-message" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
