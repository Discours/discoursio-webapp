import { For, createSignal, Show, onMount, createEffect } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import { Icon } from '../_shared/Icon'
import { Loading } from '../Loading'
import DialogCard from '../Inbox/DialogCard'
import Search from '../Inbox/Search'
import { useAuthorsStore } from '../../stores/zine/authors'
import MarkdownIt from 'markdown-it'
// const { session } = useAuthStore()

import '../../styles/Inbox.scss'
// Для моков
import { createClient } from '@urql/core'
import { findAndLoadGraphQLConfig } from '@graphql-codegen/cli'
// import { useAuthStore } from '../../stores/auth'
import { useSession } from '../../context/session'

const md = new MarkdownIt({
  linkify: true
})
const OWNER_ID = '501'
const client = createClient({
  url: 'https://graphqlzero.almansi.me/api'
})

// console.log('!!! session:', session)
// interface InboxProps {
//   chats?: Chat[]
//   messages?: Message[]
// }

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
  const [messages, setMessages] = createSignal([])
  const [authors, setAuthors] = createSignal<Author[]>([])
  const [postMessageText, setPostMessageText] = createSignal('')
  const [loading, setLoading] = createSignal<boolean>(false)
  const [currentSlug, setCurrentSlug] = createSignal<Author['slug'] | null>()

  const { session } = useSession()
  const { sortedAuthors } = useAuthorsStore()

  createEffect(() => {
    setAuthors(sortedAuthors())
    console.log('!!! session():', session())
    setCurrentSlug(session()?.user?.slug)
  })

  // Поиск по диалогам
  const getQuery = (query) => {
    if (query().length >= 2) {
      const match = userSearch(authors(), query())
      console.log('!!! match:', match)
      setAuthors(match)
    } else {
      setAuthors(sortedAuthors())
    }
  }

  const fetchMessages = async (query) => {
    const response = await client
      .query(query, {
        options: { slice: { start: 0, end: 3 } }
      })
      .toPromise()
    if (response.error) console.debug('getMessages', response.error)
    setMessages(response.data.comments.data)
  }

  let chatWindow
  onMount(async () => {
    setLoading(true)
    try {
      await fetchMessages(messageQuery)
    } catch (error) {
      setLoading(false)
      console.error([fetchMessages], error)
    } finally {
      setLoading(false)
      chatWindow.scrollTop = chatWindow.scrollHeight
    }
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

  let formParent // autoresize ghost element
  const handleChangeMessage = (event) => {
    setPostMessageText(event.target.value)
  }
  createEffect(() => {
    formParent.dataset.replicatedValue = postMessageText()
  })

  return (
    <div class="messages container">
      <div class="row">
        <div class="chat-list col-md-4">
          <Search placeholder="Поиск" onChange={getQuery} />
          <div class="chat-list__types">
            <ul>
              <li>
                <strong>Все</strong>
              </li>
              <li>Переписки</li>
              <li>Группы</li>
            </ul>
          </div>
          <div class="holder">
            <div class="dialogs">
              <For each={authors()}>{(author) => <DialogCard author={author} online={true} />}</For>
            </div>
          </div>
        </div>

        <div class="col-md-8 conversation">
          <div class="interlocutor user--online">
            <AuthorCard author={{} as Author} hideFollow={true} />
            <div class="user-status">Online</div>
          </div>

          <div class="conversation__messages">
            <div class="conversation__messages-container" ref={chatWindow}>
              <Show when={loading()}>
                <Loading />
              </Show>
              <For each={messages()}>
                {(comment: { body: string; id: string; email: string }) => (
                  <div
                    class={`conversation__message-container
                  ${
                    OWNER_ID === comment.id
                      ? 'conversation__message-container--own'
                      : 'conversation__message-container--other'
                  }`}
                  >
                    <div class="conversation__message">
                      <div innerHTML={md.render(comment.body)} />
                      <div class="conversation__message-details">
                        <time>14:26</time>
                        {comment.email} id: {comment.id}
                      </div>
                      <button class="conversation__context-popup-control">
                        <Icon name="ellipsis" />
                      </button>
                    </div>
                  </div>
                )}
              </For>

              {/*<div class="conversation__date">*/}
              {/*  <time>12 сентября</time>*/}
              {/*</div>*/}
            </div>
          </div>

          <div class="message-form">
            <div class="wrapper">
              <div class="grow-wrap" ref={formParent}>
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
