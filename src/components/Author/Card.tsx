import type { Author } from '../../graphql/types.gen'
import Userpic from './Userpic'
import { Icon } from '../Nav/Icon'
import style from './Card.module.scss'
import { createMemo, For, Show } from 'solid-js'
import { translit } from '../../utils/ru2en'
import { t } from '../../utils/intl'
import { useAuthStore } from '../../stores/auth'
import { locale } from '../../stores/ui'
import { follow, unfollow } from '../../stores/zine/common'
import { clsx } from 'clsx'

interface AuthorCardProps {
  compact?: boolean
  hideDescription?: boolean
  hideFollow?: boolean
  hasLink?: boolean
  subscribed?: boolean
  author: Author
  isAuthorPage?: boolean
  noSocialButtons?: boolean
}

export const AuthorCard = (props: AuthorCardProps) => {
  const { session } = useAuthStore()

  const subscribed = createMemo<boolean>(
    () => session()?.news?.authors?.some((u) => u === props.author.slug) || false
  )
  const canFollow = createMemo(() => !props.hideFollow && session()?.user?.slug !== props.author.slug)
  const bio = () => props.author.bio || t('Our regular contributor')
  const name = () => {
    return props.author.name === 'Дискурс' && locale() !== 'ru'
      ? 'Discours'
      : translit(props.author.name || '', locale() || 'ru')
  }
  // TODO: reimplement AuthorCard
  return (
    <div class={style.author} classList={{ [style.authorPage]: props.isAuthorPage }}>
      <Userpic user={props.author} hasLink={props.hasLink} isBig={props.isAuthorPage} />

      <div class={style.authorDetails}>
        <div class={style.authorDetailsWrapper}>
          <Show when={props.hasLink}>
            <a class={style.authorName} href={`/author/${props.author.slug}`}>
              {name()}
            </a>
          </Show>
          <Show when={!props.hasLink}>
            <div class={style.authorName}>{name()}</div>
          </Show>

          <Show when={!props.hideDescription}>
            <div class={style.authorAbout}>{bio()}</div>
          </Show>
        </div>

        <Show when={canFollow()}>
          <div class={style.authorSubscribe}>
            <Show
              when={subscribed()}
              fallback={
                <button
                  onClick={() => follow}
                  class={clsx('button button--subscribe', style.button, style.buttonSubscribe)}
                >
                  <Icon name="author-subscribe" class={style.icon} />
                  <span class={style.buttonLabel}>&nbsp;{t('Follow')}</span>
                </button>
              }
            >
              <button
                onClick={() => unfollow}
                class={clsx('button button--subscribe', style.button, style.buttonSubscribe)}
              >
                <Icon name="author-unsubscribe" class={style.icon} />
                <span class={style.buttonLabel}>-&nbsp;{t('Unfollow')}</span>
              </button>
            </Show>

            <Show when={!props.compact}>
              <button class={clsx(style.buttonWrite, style.button, 'button button--subscribe-topic')}>
                <Icon name="edit" class={style.icon} />
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
