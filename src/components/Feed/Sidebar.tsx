import { useStore } from '@nanostores/solid'
import type { Author, Shout } from '../../graphql/types.gen'
import { session } from '../../stores/auth'
import { useAuthorsStore } from '../../stores/zine/authors'
import { t } from '../../utils/intl'
import Icon from '../Nav/Icon'

type FeedSidebarProps = {
  authors: Author[]
}

export const FeedSidebar = (props: FeedSidebarProps) => {
  // const seen = useStore(seenstore)
  const auth = useStore(session)
  // const topics = useTopicsStore()
  const { getSortedAuthors: authors } = useAuthorsStore()
  // const articlesByTopics = useStore(abt)

  // const topicIsSeen = (topic: string) => {
  //   let allSeen = false
  //   articlesByTopics()[topic].forEach((s: Shout) => (allSeen = !seen()[s.slug]))
  //   return allSeen
  // }
  //
  // const authorIsSeen = (slug: string) => {
  //   return !!seen()[slug]
  // }

  return (
    <>
      <ul>
        <li>
          <a href="#">
            <strong>Мои дискуссии</strong>
          </a>
        </li>
        <li>
          <a href="#">
            <strong>Помощь сообществу</strong>
          </a>
        </li>
        <li>
          <a href="#">Редактирование</a>
          <span class="counter">7</span>
        </li>
        <li>
          <a href="#">Поделиться историей</a>
          <span class="counter">18</span>
        </li>
        <li>
          <a href="#">Проголосовать</a>
          <span class="counter">283</span>
        </li>
        <li>
          <a href="#">Подписки на форуме</a>
        </li>
      </ul>
      <ul>
        <li>
          <a href="/feed?by=subscribed">
            <strong>{t('My subscriptions')}</strong>
          </a>
        </li>
        {/*FIXME rework seen*/}
        {/*<For each={auth()?.info?.authors}>*/}
        {/*  {(aslug) => (*/}
        {/*    <li>*/}
        {/*      <a href={`/author/${aslug}`} classList={{ unread: authorIsSeen(aslug) }}>*/}
        {/*        <small>@{aslug}</small>*/}
        {/*        {(authors()[aslug] as Author).name}*/}
        {/*      </a>*/}
        {/*    </li>*/}
        {/*  )}*/}
        {/*</For>*/}

        {/*<For each={auth()?.info?.topics as string[]}>*/}
        {/*  {(topic: string) => (*/}
        {/*    <li>*/}
        {/*      <a href={`/author/${topic}`} classList={{ unread: topicIsSeen(topic) }}>*/}
        {/*        {topics()[topic]?.title}*/}
        {/*      </a>*/}
        {/*    </li>*/}
        {/*  )}*/}
        {/*</For>*/}
      </ul>

      <p class="settings">
        <a href="/feed/settings">
          <strong>{t('Feed settings')}</strong>
        </a>
        <Icon name="settings" />
      </p>
    </>
  )
}
