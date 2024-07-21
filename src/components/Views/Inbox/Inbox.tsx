import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'

import { Icon } from '~/components/_shared/Icon'
import { InviteMembers } from '~/components/_shared/InviteMembers'
import { Popover } from '~/components/_shared/Popover'
import { useInbox } from '~/context/inbox'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useUI } from '~/context/ui'
import type {
  Chat,
  ChatMember,
  Message as MessageType,
  MutationCreate_MessageArgs
} from '~/graphql/schema/chat.gen'
import type { Author } from '~/graphql/schema/core.gen'
import SimplifiedEditor from '../../Editor/SimplifiedEditor'
import DialogCard from '../../Inbox/DialogCard'
import DialogHeader from '../../Inbox/DialogHeader'
import { Message } from '../../Inbox/Message'
import MessagesFallback from '../../Inbox/MessagesFallback'
import Search from '../../Inbox/Search'
import { Modal } from '../../_shared/Modal'

import { useSearchParams } from '@solidjs/router'
import styles from './Inbox.module.scss'

type InboxSearchParams = {
  by?: string
  initChat: string
  chat: string
}

const userSearch = (array: Author[], keyword: string) => {
  return array.filter((value) => new RegExp(keyword.trim(), 'gi').test(value.name || ''))
}

type Props = {
  authors: Author[]
  isLoaded: boolean
}

export const InboxView = (props: Props) => {
  const { t } = useLocalize()
  const { chats, messages, setMessages, loadChats, getMessages, sendMessage, createChat } = useInbox()
  const [recipients, setRecipients] = createSignal<Author[]>(props.authors)
  const [sortByGroup, setSortByGroup] = createSignal(false)
  const [sortByPerToPer, setSortByPerToPer] = createSignal(false)
  const [currentDialog, setCurrentDialog] = createSignal<Chat>()
  const [messageToReply, setMessageToReply] = createSignal<MessageType | null>(null)
  const [isClear, setClear] = createSignal(false)
  const [isScrollToNewVisible, setIsScrollToNewVisible] = createSignal(false)
  const { session } = useSession()
  const authorId = createMemo<number>(() => session()?.user?.app_data?.profile?.id || 0)
  const [searchParams, changeSearchParams] = useSearchParams<InboxSearchParams>()
  const { showModal } = useUI()
  const handleOpenInviteModal = () => showModal('inviteMembers')
  let messagesContainerRef: HTMLDivElement | null

  const getQuery = (query: () => string) => {
    if (query().length >= 2) {
      const match = userSearch(recipients(), query())
      setRecipients(match)
    }
  }

  const handleOpenChat = async (chat: Chat) => {
    setCurrentDialog(chat)
    changeSearchParams({
      chat: chat.id
    })
    try {
      const mmm = await getMessages?.(chat.id)
      if (mmm) {
        setMessages(mmm)
      }
    } catch (error) {
      console.error('[getMessages]', error)
    } finally {
      messagesContainerRef?.scroll({
        top: messagesContainerRef?.scrollHeight,
        behavior: 'instant'
      })
    }
  }

  const handleSubmit = (message: string) => {
    sendMessage?.({
      body: message,
      reply_to: messageToReply()?.id,
      chat_id: currentDialog()?.id || ''
    } as MutationCreate_MessageArgs)
    setClear(true)
    setMessageToReply(null)
    if (messagesContainerRef)
      (messagesContainerRef as HTMLDivElement).scrollTop = messagesContainerRef?.scrollHeight || 0
    setClear(false)
  }

  createEffect(async () => {
    if (searchParams?.chat) {
      const chatToOpen = chats()?.find((chat) => chat.id.toString() === searchParams?.chat)
      if (!chatToOpen) return
      await handleOpenChat(chatToOpen)
      return
    }
    if (searchParams?.initChat) {
      try {
        const newChat = await createChat([Number(searchParams?.initChat)], '')
        await loadChats()
        changeSearchParams({
          initChat: undefined,
          chat: newChat.chat.id
        })
        const chatToOpen = chats().find((chat) => chat.id === newChat.chat.id)
        await handleOpenChat(chatToOpen as Chat)
      } catch (error) {
        console.error(error)
      }
    }
  })

  const chatsToShow = () => {
    if (!chats()) return
    const sorted = chats().sort((a: Chat, b: Chat) => {
      return (b?.updated_at || 0) - (a?.updated_at || 0)
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
    return (messages?.() || []).find((message: MessageType) => message.id === messageId)
  }

  createEffect(
    on(
      () => messages?.() || [],
      (_mmm) => {
        if (!messagesContainerRef) return
        if (messagesContainerRef.scrollTop >= messagesContainerRef.scrollHeight) return
        if (messagesContainerRef) {
          messagesContainerRef?.scroll({
            top: messagesContainerRef.scrollHeight,
            behavior: 'smooth'
          })
        }
      }
    )
  )
  const handleScrollMessageContainer = () => {
    if (
      (messagesContainerRef?.scrollHeight || 0) - (messagesContainerRef?.scrollTop || 0) >
      (messagesContainerRef?.clientHeight || 0) * 1.5
    ) {
      setIsScrollToNewVisible(true)
    } else {
      setIsScrollToNewVisible(false)
    }
  }
  const handleScrollToNew = () => {
    messagesContainerRef?.scroll({
      top: messagesContainerRef?.scrollHeight,
      behavior: 'smooth'
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
              <li class={clsx({ 'view-switcher__item--selected': !(sortByPerToPer() || sortByGroup()) })}>
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
                    members={chat?.members as ChatMember[]}
                    ownId={authorId()}
                    lastUpdate={chat.updated_at || Date.now()}
                    counter={chat.unread || 0}
                    message={chat.messages?.pop()?.body || ''}
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
            <DialogHeader ownId={authorId()} chat={currentDialog() as Chat} />
            <div class={styles.conversationMessages}>
              <Show when={isScrollToNewVisible()}>
                <Popover content={t('To new messages')}>
                  {(triggerRef: (el: HTMLElement) => void) => (
                    <div ref={triggerRef} class={styles.scrollToNew} onClick={handleScrollToNew}>
                      <Icon name="arrow-right" class={styles.icon} />
                    </div>
                  )}
                </Popover>
              </Show>
              <div
                class={styles.messagesContainer}
                ref={(el) => (messagesContainerRef = el)}
                onScroll={handleScrollMessageContainer}
              >
                <For each={messages?.() || []}>
                  {(m) => (
                    <Message
                      content={m}
                      ownId={authorId()}
                      members={currentDialog()?.members as ChatMember[]}
                      replyBody={(m?.reply_to && findToReply(m?.reply_to || 0)?.body) || ''}
                      replyClick={() => setMessageToReply(m)}
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
                  placeholder={t('New message')}
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
