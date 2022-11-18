import type { Author } from '../../graphql/types.gen'
import Userpic from './Userpic'
import { Icon } from '../_shared/Icon'
import styles from './Card.module.scss'
import { createMemo, For, Show } from 'solid-js'
import { translit } from '../../utils/ru2en'
import { t } from '../../utils/intl'
import { locale } from '../../stores/ui'
import { follow, unfollow } from '../../stores/zine/common'
import { clsx } from 'clsx'
import { useSession } from '../../context/session'

interface AuthorCardProps {
  compact?: boolean
  hideDescription?: boolean
  hideFollow?: boolean
  hasLink?: boolean
  subscribed?: boolean
  author: Author
  isAuthorPage?: boolean
  noSocialButtons?: boolean
  isAuthorsList?: boolean
  truncateBio?: boolean
}

export const AuthorCard = (props: AuthorCardProps) => {
  const { session } = useSession()

  const subscribed = createMemo<boolean>(
    () => session()?.news?.authors?.some((u) => u === props.author.slug) || false
  )
  const canFollow = createMemo(() => !props.hideFollow && session()?.user?.slug !== props.author.slug)
  const bio = () => {
    const d = document.createElement('div')
    d.innerHTML = props.author.bio
    return d.textContent || t('Our regular contributor')
  }
  const name = () => {
    return props.author.name === 'Дискурс' && locale() !== 'ru'
      ? 'Discours'
      : translit(props.author.name || '', locale() || 'ru')
  }
  // TODO: reimplement AuthorCard
  return (
    <div
      class={clsx(styles.author)}
      classList={{
        [styles.authorPage]: props.isAuthorPage,
        [styles.authorsListItem]: props.isAuthorsList
      }}
    >
      <Userpic
        user={props.author}
        hasLink={props.hasLink}
        isBig={props.isAuthorPage}
        isAuthorsList={props.isAuthorsList}
      />

      <div class={styles.authorDetails}>
        <div class={styles.authorDetailsWrapper}>
          <Show when={props.hasLink}>
            <a class={styles.authorName} href={`/author/${props.author.slug}`}>
              {name()}
            </a>
          </Show>
          <Show when={!props.hasLink}>
            <div class={styles.authorName}>{name()}</div>
          </Show>

          <Show when={!props.hideDescription}>
            {props.isAuthorsList}
            <div class={styles.authorAbout} classList={{ 'text-truncate': props.truncateBio }}>
              {bio()}
            </div>
          </Show>
        </div>

        <Show when={canFollow()}>
          <div class={styles.authorSubscribe}>
            <Show
              when={subscribed()}
              fallback={
                <button
                  onClick={() => follow}
                  class={clsx('button', styles.button)}
                  classList={{
                    [styles.buttonSubscribe]: !props.isAuthorsList,
                    'button--subscribe': !props.isAuthorsList,
                    'button--subscribe-topic': props.isAuthorsList,
                    [styles.buttonWrite]: props.isAuthorsList
                  }}
                >
                  <Show when={!props.isAuthorsList}>
                    <Icon name="author-subscribe" class={styles.icon} />
                  </Show>
                  <span class={styles.buttonLabel}>{t('Follow')}</span>
                </button>
              }
            >
              <button
                onClick={() => unfollow}
                classList={{
                  [styles.buttonSubscribe]: !props.isAuthorsList,
                  'button--subscribe': !props.isAuthorsList,
                  'button--subscribe-topic': props.isAuthorsList,
                  [styles.buttonWrite]: props.isAuthorsList
                }}
              >
                <Show when={!props.isAuthorsList}>
                  <Icon name="author-unsubscribe" class={styles.icon} />
                </Show>
                <span class={styles.buttonLabel}>{t('Unfollow')}</span>
              </button>
            </Show>

            <Show when={!props.compact && !props.isAuthorsList}>
              <button class={clsx(styles.buttonWrite, styles.button, 'button button--subscribe-topic')}>
                <Icon name="edit" class={styles.icon} />
                {t('Write')}
              </button>

              <Show when={!props.noSocialButtons}>
                <For each={props.author.links}>{(link) => <a href={link} />}</For>
              </Show>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}
