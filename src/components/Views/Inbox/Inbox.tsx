import type { Chat, Message as MessageType } from '../../../graphql/schema/chat.gen'
import type { Author } from '../../../graphql/schema/core.gen'

import { clsx } from 'clsx'
import { For, createSignal, Show, onMount, createEffect, createMemo, on } from 'solid-js'

import { useInbox } from '../../../context/inbox'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { useRouter } from '../../../stores/router'
import { showModal } from '../../../stores/ui'
import { useAuthorsStore } from '../../../stores/zine/authors'
import { Icon } from '../../_shared/Icon'
import { InviteMembers } from '../../_shared/InviteMembers'
import { Popover } from '../../_shared/Popover'
import SimplifiedEditor from '../../Editor/SimplifiedEditor'
import DialogCard from '../../Inbox/DialogCard'
import DialogHeader from '../../Inbox/DialogHeader'
import { Message } from '../../Inbox/Message'
import MessagesFallback from '../../Inbox/MessagesFallback'
import Search from '../../Inbox/Search'
import { Modal } from '../../Nav/Modal'

import styles from './Inbox.module.scss'

type InboxSearchParams = {
  by?: string
  initChat: string
  chat: string
}

const userSearch = (array: Author[], keyword: string) => {
  return array.filter((value) => new RegExp(keyword.trim(), 'gi').test(value.name))
}

const handleOpenInviteModal = () => {
  showModal('inviteMembers')
}

type Props = {
  authors: Author[]
  isLoaded: boolean
}

export const InboxView = (props: Props) => {
  const { t } = useLocalize()
  const {
    chats,
    messages,
    actions: { loadChats, getMessages, sendMessage, createChat },
  } = useInbox()
  const [recipients, setRecipients] = createSignal<Author[]>(props.authors)
  const [sortByGroup, setSortByGroup] = createSignal(false)
  const [sortByPerToPer, setSortByPerToPer] = createSignal(false)
  const [currentDialog, setCurrentDialog] = createSignal<Chat>()
  const [messageToReply, setMessageToReply] = createSignal<MessageType | null>(null)
  const [isClear, setClear] = createSignal(false)
  const [isScrollToNewVisible, setIsScrollToNewVisible] = createSignal(false)
  const { author } = useSession()
  const currentUserId = createMemo(() => author()?.id)
  const { changeSearchParams, searchParams } = useRouter<InboxSearchParams>()

  const messagesContainerRef: { current: HTMLDivElement } = {
    current: null,
  }

  const getQuery = (query) => {
    if (query().length >= 2) {
      const match = userSearch(recipients(), query())
      setRecipients(match)
    }
  }
  const handleOpenChat = async (chat: Chat) => {
    setCurrentDialog(chat)
    changeSearchParams({
      chat: chat.id,
    })
    try {
      await getMessages(chat.id)
    } catch (error) {
      console.error('[getMessages]', error)
    } finally {
      messagesContainerRef.current.scroll({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'instant',
      })
    }
  }

  const handleSubmit = async (message: string) => {
    sendMessage({
      body: message,
      chat_id: currentDialog()?.id.toString(),
      reply_to: messageToReply()?.id,
    })
    setClear(true)
    setMessageToReply(null)
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    setClear(false)
  }

  createEffect(async () => {
    if (searchParams().chat) {
      const chatToOpen = chats()?.find((chat) => chat.id === searchParams().chat)
      if (!chatToOpen) return
      await handleOpenChat(chatToOpen)
      return
    }
    if (searchParams().initChat) {
      try {
        const newChat = await createChat([Number(searchParams().initChat)], '')
        await loadChats()
        changeSearchParams({
          initChat: null,
          chat: newChat.chat.id,
        })
        const chatToOpen = chats().find((chat) => chat.id === newChat.chat.id)
        await handleOpenChat(chatToOpen)
      } catch (error) {
        console.error(error)
      }
    }
  })

  const chatsToShow = () => {
    if (!chats()) return
    const sorted = chats().sort((a, b) => {
      return b.updated_at - a.updated_at
    })
    if (sortByPerToPer()) {
      return sorted.filter((chat) => (chat.title || '').trim().length === 0)
    }
    if (sortByGroup()) {
      return sorted.filter((chat) => (chat.title || '').trim().length > 0)
    }
    return sorted
  }

  const findToReply = (messageId: number) => {
    return messages().find((message: MessageType) => message.id === messageId)
  }

  createEffect(
    on(
      () => messages(),
      () => {
        if (!messagesContainerRef.current) {
          return
        }
        if (messagesContainerRef.current.scrollTop >= messagesContainerRef.current.scrollHeight) {
          return
        }
        messagesContainerRef.current.scroll({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        })
      },
    ),
    { defer: true },
  )
  const handleScrollMessageContainer = () => {
    if (
      messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop >
      messagesContainerRef.current.clientHeight * 1.5
    ) {
      setIsScrollToNewVisible(true)
    } else {
      setIsScrollToNewVisible(false)
    }
  }
  const handleScrollToNew = () => {
    messagesContainerRef.current.scroll({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth',
    })
    setIsScrollToNewVisible(false)
  }

  onMount(async () => {
    await loadChats()
  })

  return (
    <div class={clsx('container', styles.Inbox)}>
      <Modal variant="medium" name="inviteMembers">
        <InviteMembers title={t('Create Chat')} variant={'recipients'} />
      </Modal>
      {/*<CreateModalContent users={recipients()} />*/}
      <div class={clsx('row', styles.row)}>
        <div class={clsx(styles.chatList, 'col-md-8')}>
          <div class={styles.sidebarHeader}>
            <Search placeholder="Поиск" onChange={getQuery} />
            <button type="button" onClick={handleOpenInviteModal}>
              <Icon name="plus-button" style={{ width: '40px', height: '40px' }} />
            </button>
          </div>

          <Show when={chatsToShow()}>
            <ul class="view-switcher">
              <li class={clsx({ 'view-switcher__item--selected': !sortByPerToPer() && !sortByGroup() })}>
                <button
                  onClick={() => {
                    setSortByPerToPer(false)
                    setSortByGroup(false)
                  }}
                >
                  {t('All')}
                </button>
              </li>
              <li class={clsx({ 'view-switcher__item--selected': sortByPerToPer() })}>
                <button
                  onClick={() => {
                    setSortByPerToPer(true)
                    setSortByGroup(false)
                  }}
                >
                  {t('Personal')}
                </button>
              </li>
              <li class={clsx({ 'view-switcher__item--selected': sortByGroup() })}>
                <button
                  onClick={() => {
                    setSortByGroup(true)
                    setSortByPerToPer(false)
                  }}
                >
                  {t('Groups')}
                </button>
              </li>
            </ul>
          </Show>
          <div class={styles.holder}>
            <div class={styles.dialogs}>
              <For each={chatsToShow()}>
                {(chat) => (
                  <DialogCard
                    onClick={() => handleOpenChat(chat)}
                    isOpened={chat.id === currentDialog()?.id}
                    members={chat.members}
                    ownId={currentUserId()}
                    lastUpdate={chat.updated_at}
                    counter={chat.unread}
                    message={chat.messages.pop()?.body}
                  />
                )}
              </For>
            </div>
          </div>
        </div>

        <div class={clsx('col-md-16', styles.conversation)}>
          <Show
            keyed={true}
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
              <Show when={isScrollToNewVisible()}>
                <Popover content={t('To new messages')}>
                  {(triggerRef: (el) => void) => (
                    <div ref={triggerRef} class={styles.scrollToNew} onClick={handleScrollToNew}>
                      <Icon name="arrow-right" class={styles.icon} />
                    </div>
                  )}
                </Popover>
              </Show>
              <div
                class={styles.messagesContainer}
                ref={(el) => (messagesContainerRef.current = el)}
                onScroll={handleScrollMessageContainer}
              >
                <For each={messages()}>
                  {(message) => (
                    <Message
                      content={message}
                      ownId={currentUserId()}
                      members={currentDialog().members}
                      replyBody={message.reply_to && findToReply(message.reply_to).body}
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
                <p>FIXME: messageToReply</p>
                {/*<QuotedMessage*/}
                {/*  variant="reply"*/}
                {/*  author={*/}
                {/*    currentDialog().members.find((member) => member.id === Number(messageToReply().author))*/}
                {/*      .name*/}
                {/*  }*/}
                {/*  body={messageToReply().body}*/}
                {/*  cancel={() => setMessageToReply(null)}*/}
                {/*/>*/}
              </Show>
              <div class={styles.wrapper}>
                <SimplifiedEditor
                  smallHeight={true}
                  imageEnabled={true}
                  isCancelButtonVisible={false}
                  placeholder={t('Write message')}
                  setClear={isClear()}
                  onSubmit={(message) => handleSubmit(message)}
                  submitByCtrlEnter={true}
                />
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}
