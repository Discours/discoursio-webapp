import { For, createSignal, Show, onMount, createEffect, createMemo } from 'solid-js'
import type { Author, Chat, Message as MessageType } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'
import DialogCard from '../Inbox/DialogCard'
import Search from '../Inbox/Search'
import { useSession } from '../../context/session'
import type { Client } from '@urql/core'
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
import { apiClient } from '../../utils/apiClient'
import { createChatClient } from '../../graphql/privateGraphQLClient'
import MessagesFallback from '../Inbox/MessagesFallback'
import { useRouter } from '../../stores/router'
import createChat from '../../graphql/mutation/create-chat'

const userSearch = (array: Author[], keyword: string) => {
  const searchTerm = keyword.toLowerCase()
  return array.filter((value) => {
    return value.name.toLowerCase().match(new RegExp(searchTerm, 'g'))
  })
}

export const InboxView = () => {
  const {
    chats,
    actions: { loadChats }
  } = useInbox()
  const [messages, setMessages] = createSignal<MessageType[]>([])
  const [recipients, setRecipients] = createSignal<Author[]>([])
  const [postMessageText, setPostMessageText] = createSignal('')
  const [sortByGroup, setSortByGroup] = createSignal<boolean>(false)
  const [sortByPerToPer, setSortByPerToPer] = createSignal<boolean>(false)
  const [currentDialog, setCurrentDialog] = createSignal<Chat>()
  const { session } = useSession()
  const currentUserId = createMemo(() => session()?.user.id)
  const [subClient, setSubClient] = createSignal<Client>()
  // Поиск по диалогам
  const getQuery = (query) => {
    // if (query().length >= 2) {
    //   const match = userSearch(recipients(), query())
    //   setRecipients(match)
    // } else {
    //   setRecipients(cashedRecipients())
    // }
  }

  let chatWindow

  const onMessage = (payload) => console.log(payload)

  const handleOpenChat = async (chat: Chat) => {
    setCurrentDialog(chat)
    try {
      const response = await loadMessages({ chat: chat.id })
      setMessages(response as unknown as MessageType[])
      setSubClient((_) => createChatClient(onMessage))
      // TODO: one client recreating
    } catch (error) {
      console.error('[loadMessages]', error)
    } finally {
      chatWindow.scrollTop = chatWindow.scrollHeight
    }
  }

  onMount(async () => {
    try {
      const response = await loadRecipients({ days: 365 })
      setRecipients(response as unknown as Author[])
    } catch (error) {
      console.log(error)
    }
    await loadChats()
  })

  const handleSubmit = async () => {
    try {
      const post = await apiClient.createMessage({
        body: postMessageText().toString(),
        chat: currentDialog().id.toString()
      })
      setMessages((prev) => [...prev, post.message])
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

  const { actions } = useInbox()
  const urlParams = new URLSearchParams(window.location.search)
  const params = Object.fromEntries(urlParams)
  console.log('!!! params:', params)

  createEffect(async () => {
    if (textareaParent) {
      textareaParent.dataset.replicatedValue = postMessageText()
    }
    if (params['openChat']) {
      try {
        const newChat = await actions.createChat([Number(params['chat'])], '')
        console.log('!!! newChat:', newChat)
        await handleOpenChat(newChat.chat)
        await loadChats()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const handleOpenInviteModal = () => {
    showModal('inviteToChat')
  }

  const chatsToShow = () => {
    const sorted = chats().sort((a, b) => {
      return a.updatedAt - b.updatedAt
    })
    if (sortByPerToPer()) {
      return sorted.filter((chat) => chat.title.trim().length === 0)
    } else if (sortByGroup()) {
      return sorted.filter((chat) => chat.title.trim().length > 0)
    } else {
      return sorted
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
            <button type="button" onClick={handleOpenInviteModal}>
              <Icon name="plus-button" style={{ width: '40px', height: '40px' }} />
            </button>
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
                    ownId={currentUserId()}
                    lastUpdate={chat.updatedAt}
                    counter={chat.unread}
                    message={chat.messages.pop()?.body}
                  />
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="col-md-8 conversation">
          <Show
            when={currentDialog()}
            fallback={
              <MessagesFallback
                message={t('Choose who you want to write to')}
                onClick={handleOpenInviteModal}
                actionText={t('Start conversation')}
              />
            }
          >
            <DialogHeader ownId={currentUserId()} chat={currentDialog()} />
            <div class="conversation__messages">
              <div class="conversation__messages-container" ref={chatWindow}>
                <For each={messages()}>
                  {(message) => (
                    <Message content={message} ownId={currentUserId()} members={currentDialog().members} />
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
          </Show>
        </div>
      </div>
    </div>
  )
}
