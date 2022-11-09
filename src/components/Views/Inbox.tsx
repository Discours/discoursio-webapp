import { For, createSignal, Show, onMount } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import { Icon } from '../Nav/Icon'
import { Loading } from '../Loading'
import '../../styles/Inbox.scss'
// Для моков
import { createClient } from '@urql/core'

const OWNER_ID = '501'
const client = createClient({
  url: 'https://graphqlzero.almansi.me/api'
})

// interface InboxProps {
//   chats?: Chat[]
//   messages?: Message[]
// }
const [messages, setMessages] = createSignal([])
const [postMessageText, setPostMessageText] = createSignal('')
const [loading, setLoading] = createSignal<boolean>(false)

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
const fetchMessages = async (query) => {
  const response = await client
    .query(query, {
      options: { slice: { start: 0, end: 3 } }
    })
    .toPromise()
  if (response.error) console.debug('getMessages', response.error)
  setMessages(response.data.comments.data)
}

const postMessage = async (msg: string) => {
  const response = await client.mutation(newMessageQuery, { messageBody: msg }).toPromise()
  return response.data.createComment
}

let chatWindow
onMount(() => {
  setLoading(true)
  fetchMessages(messageQuery)
    .then(() => {
      setLoading(false)
      chatWindow.scrollTop = chatWindow.scrollHeight
    })
    .catch(() => setLoading(false))
})

export const InboxView = () => {
  const handleSubmit = async () => {
    postMessage(postMessageText())
      .then((result) => {
        setMessages((prev) => [...prev, result])
      })
      .then(() => {
        setPostMessageText('')
        chatWindow.scrollTop = chatWindow.scrollHeight
        console.log('!!! msg:', messages())
      })
  }

  const handleChangeMessage = (event) => {
    setPostMessageText(event.target.value)
    console.log('!!! asd:', postMessageText().trim().length)
  }

  // TODO: get user session
  return (
    <div class="messages container">
      <div class="row">
        <div class="chat-list col-md-4">
          <form class="chat-list__search">
            <input type="search" placeholder="Поиск" />
            <button class="button">+</button>
          </form>

          <div class="chat-list__types">
            <ul>
              <li>
                <strong>
                  <a href="/">Все</a>
                </strong>
              </li>
              <li>
                <a href="/">Переписки</a>
              </li>
              <li>
                <a href="/">Группы</a>
              </li>
            </ul>
          </div>

          <div class="chat-list__users">
            <ul>
              <li class="user--online chat-list__user--current">
                <AuthorCard author={{} as Author} hideFollow={true} />
                <div class="last-message-date">19:48</div>
                <div class="last-message-text">
                  Assumenda delectus deleniti dolores doloribus ducimus, et expedita facere iste laborum,
                  nihil similique suscipit, ut voluptatem. Accusantium consequuntur doloremque ex molestiae
                  nemo.
                </div>
              </li>
            </ul>
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
                      {comment.body}
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

          <div class="conversation__message-form">
            <textarea
              value={postMessageText()}
              onInput={(event) => handleChangeMessage(event)}
              placeholder="Написать сообщение"
            />
            <button type="submit" disabled={postMessageText().length === 0} onClick={handleSubmit}>
              <Icon name="send-message" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
