import { useStore } from '@nanostores/solid'
import { For } from 'solid-js'
import type { Author } from '../../graphql/types.gen'
import { session } from '../../stores/auth'
import { useAuthorsStore } from '../../stores/zine/authors'
import { t } from '../../utils/intl'
import Icon from '../Nav/Icon'
import { useTopicsStore } from '../../stores/zine/topics'
import { useArticlesStore } from '../../stores/zine/articles'
import { useSeenStore } from '../../stores/zine/seen'

type FeedSidebarProps = {
  authors: Author[]
}

export const FeedSidebar = (props: FeedSidebarProps) => {
  const { getSeen: seen } = useSeenStore()
  const auth = useStore(session)
  const { getSortedAuthors: authors } = useAuthorsStore({ authors: props.authors })
  const { getArticlesByTopic } = useArticlesStore()
  const { getTopicEntities } = useTopicsStore()

  const checkTopicIsSeen = (topicSlug: string) => {
    return getArticlesByTopic()[topicSlug].every((article) => Boolean(seen()[article.slug]))
  }

  const checkAuthorIsSeen = (authorSlug: string) => {
    return Boolean(seen()[authorSlug])
  }

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

        <For each={auth()?.info?.authors}>
          {(authorSlug) => (
            <li>
              <a href={`/author/${authorSlug}`} classList={{ unread: checkAuthorIsSeen(authorSlug) }}>
                <small>@{authorSlug}</small>
                {authors()[authorSlug].name}
              </a>
            </li>
          )}
        </For>

        <For each={auth()?.info?.topics}>
          {(topicSlug) => (
            <li>
              <a href={`/author/${topicSlug}`} classList={{ unread: checkTopicIsSeen(topicSlug) }}>
                {getTopicEntities()[topicSlug]?.title}
              </a>
            </li>
          )}
        </For>
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
