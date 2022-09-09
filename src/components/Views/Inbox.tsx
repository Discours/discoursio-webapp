import type { Author, Chat, Message } from '../../graphql/types.gen'
import { AuthorCard } from '../Author/Card'
import Icon from '../Nav/Icon'
import '../../styles/Inbox.scss'

interface InboxProps {
  chats?: Chat[]
  messages?: Message[]
}

export default (_props: InboxProps) => {
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
              <li>
                <AuthorCard author={{} as Author} hideFollow={true} />
                <div class="last-message-date">12:15</div>
                <div class="last-message-text">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                </div>
              </li>
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
            <div class="conversation__messages-container">
              <div class="conversation__message-container conversation__message-container--other">
                <div class="conversation__message">
                  Круто, беру в оборот!
                  <div class="conversation__message-details">
                    <time>14:26</time>
                  </div>
                  <button class="conversation__context-popup-control">
                    <Icon name="ellipsis" />
                  </button>
                </div>
              </div>

              <div class="conversation__message-container conversation__message-container--own">
                <div class="conversation__message">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut beatae earum iste itaque
                  libero perspiciatis possimus quod! Accusamus, aliquam amet consequuntur debitis dolorum
                  esse laudantium magni omnis rerum voluptatem voluptates!
                  <div class="conversation__message-details">
                    <time>14:31</time>
                    Отредактировано
                  </div>
                  <button class="conversation__context-popup-control">
                    <Icon name="ellipsis" />
                  </button>
                </div>
              </div>

              <div class="conversation__date">
                <time>12 сентября</time>
              </div>

              <div class="conversation__message-container conversation__message-container--other">
                <div class="conversation__message">
                  Нужна грамотная инфраструктура для сообщений, если ожидается нагрузка - надо опираться на
                  это. Но в целом это несложно сделать.
                  <div class="conversation__message-details">
                    <time>10:47</time>
                  </div>
                  <button class="conversation__context-popup-control">
                    <Icon name="ellipsis" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form class="conversation__message-form">
            <input type="text" placeholder="Написать сообщение" />
            <button type="submit">
              <Icon name="send-message" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
