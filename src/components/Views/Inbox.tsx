import { For, createSignal, Show, onMount, createEffect, createMemo } from 'solid-js'
import type { Author, Chat, Message as MessageType } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'
import DialogCard from '../Inbox/DialogCard'
import Search from '../Inbox/Search'
import { useSession } from '../../context/session'
import Message from '../Inbox/Message'
import { loadRecipients, loadMessages } from '../../stores/inbox'
import { t } from '../../utils/intl'
import { Modal } from '../Nav/Modal'
import { showModal } from '../../stores/ui'
import CreateModalContent from '../Inbox/CreateModalContent'
import { useInbox } from '../../context/inbox'
import DialogHeader from '../Inbox/DialogHeader'
import { apiClient } from '../../utils/apiClient'
import MessagesFallback from '../Inbox/MessagesFallback'
import { useRouter } from '../../stores/router'
import { clsx } from 'clsx'
import styles from '../../styles/Inbox.module.scss'
import QuotedMessage from '../Inbox/QuotedMessage'

const userSearch = (array: Author[], keyword: string) => {
  const searchTerm = keyword.toLowerCase()
  return array.filter((value) => {
    return value.name.toLowerCase().match(new RegExp(searchTerm, 'g'))
  })
}
const { changeSearchParam } = useRouter()
export const InboxView = () => {
  const {
    chats,
    actions: { loadChats } // setListener
  } = useInbox()
  const [messages, setMessages] = createSignal<MessageType[]>([])
  const [recipients, setRecipients] = createSignal<Author[]>([])
  const [postMessageText, setPostMessageText] = createSignal('')
  const [sortByGroup, setSortByGroup] = createSignal<boolean>(false)
  const [sortByPerToPer, setSortByPerToPer] = createSignal<boolean>(false)
  const [currentDialog, setCurrentDialog] = createSignal<Chat>()
  const [messageToReply, setMessageToReply] = createSignal<MessageType | null>(null)
  const { session } = useSession()
  const currentUserId = createMemo(() => session()?.user.id)
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

  const handleOpenChat = async (chat: Chat) => {
    setCurrentDialog(chat)
    changeSearchParam('chat', `${chat.id}`)
    try {
      const response = await loadMessages({ chat: chat.id })
      setMessages(response as unknown as MessageType[])
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
        chat: currentDialog().id.toString(),
        replyTo: messageToReply()?.id
      })
      setMessages((prev) => [...prev, post.message])
      setPostMessageText('')
      setMessageToReply(null)
      chatWindow.scrollTop = chatWindow.scrollHeight
      console.log('!!! messages:', messages())
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
  createEffect(async () => {
    if (textareaParent) {
      textareaParent.dataset.replicatedValue = postMessageText()
    }
    if (params['initChat']) {
      try {
        const newChat = await actions.createChat([Number(params['initChat'])], '')
        await loadChats()
        const chatToOpen = chats().find((chat) => chat.id === newChat.chat.id)
        await handleOpenChat(chatToOpen)
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

  const findToReply = (messageId) => {
    return messages().find((message) => message.id === messageId)
  }

  return (
    <div class={clsx('container', styles.Inbox)}>
      <Modal variant="narrow" name="inviteToChat">
        <CreateModalContent users={recipients()} />
      </Modal>
      <div class={clsx('row', styles.row)}>
        <div class={clsx(styles.chatList, 'col-md-4')}>
          <div class={styles.sidebarHeader}>
            <Search placeholder="Поиск" onChange={getQuery} />
            <button type="button" onClick={handleOpenInviteModal}>
              <Icon name="plus-button" style={{ width: '40px', height: '40px' }} />
            </button>
          </div>

          <Show when={chatsToShow}>
            <div class={styles.chatListTypes}>
              <ul>
                <li
                  class={clsx({ [styles.selected]: !sortByPerToPer() && !sortByGroup() })}
                  onClick={() => {
                    setSortByPerToPer(false)
                    setSortByGroup(false)
                  }}
                >
                  <span>{t('All')}</span>
                </li>
                <li
                  class={clsx({ [styles.selected]: sortByPerToPer() })}
                  onClick={() => {
                    setSortByPerToPer(true)
                    setSortByGroup(false)
                  }}
                >
                  <span>{t('Personal')}</span>
                </li>
                <li
                  class={clsx({ [styles.selected]: sortByGroup() })}
                  onClick={() => {
                    setSortByGroup(true)
                    setSortByPerToPer(false)
                  }}
                >
                  <span>{t('Groups')}</span>
                </li>
              </ul>
            </div>
          </Show>
          <div class={styles.holder}>
            <div class={styles.dialogs}>
              <For each={chatsToShow()}>
                {(chat) => (
                  <DialogCard
                    onClick={() => handleOpenChat(chat)}
                    isOpened={chat.id === currentDialog()?.id}
                    title={chat.title || chat.members[0].name}
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

        <div class={clsx('col-md-8', styles.conversation)}>
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
            <div class={styles.conversationMessages}>
              <div class={styles.messagesContainer} ref={chatWindow}>
                <For each={messages()}>
                  {(message) => (
                    <Message
                      content={message}
                      ownId={currentUserId()}
                      members={currentDialog().members}
                      replyBody={message.replyTo && findToReply(message.replyTo).body}
                      replyClick={() => setMessageToReply(message)}
                    />
                  )}
                </For>
                {/*<div class={styles.conversationDate}>*/}
                {/*  <time>12 сентября</time>*/}
                {/*</div>*/}
              </div>
            </div>

            <div class={styles.messageForm}>
              <Show when={messageToReply()}>
                <QuotedMessage
                  variant="reply"
                  author={
                    currentDialog().members.find((member) => member.id === Number(messageToReply().author))
                      .name
                  }
                  body={messageToReply().body}
                  cancel={() => setMessageToReply(null)}
                />
              </Show>
              <div class={styles.wrapper}>
                <div class={styles.growWrap} ref={textareaParent}>
                  <textarea
                    class={styles.textInput}
                    value={postMessageText()}
                    rows={1}
                    onInput={(event) => handleChangeMessage(event)}
                    placeholder={t('Write message')}
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
