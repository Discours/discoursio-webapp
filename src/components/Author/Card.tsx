import { For, Show } from 'solid-js/web'
import type { Author } from '../../graphql/types.gen'
import Userpic from './Userpic'
import { Icon } from '../Nav/Icon'
import './Card.scss'
import { createMemo } from 'solid-js'
import { translit } from '../../utils/ru2en'
import { t } from '../../utils/intl'
import { useAuthStore } from '../../stores/auth'
import { locale } from '../../stores/ui'
import { follow, unfollow } from '../../stores/zine/common'

interface AuthorCardProps {
  compact?: boolean
  hideDescription?: boolean
  hideFollow?: boolean
  hasLink?: boolean
  subscribed?: boolean
  author: Author
}

export const AuthorCard = (props: AuthorCardProps) => {
  const { session } = useAuthStore()

  const subscribed = createMemo(
    () =>
      !!session()
        ?.news?.authors?.filter((u) => u === props.author.slug)
        .pop()
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
    <>
      <Show when={props.author?.slug}>
        <div class="author">
          <Userpic user={props.author} hasLink={props.hasLink} />

          <div class="author__details">
            <div class="author__details-wrapper">
              <Show when={props.hasLink}>
                <a class="author__name text-3xl text-2xl" href={`/author/${props.author.slug}`}>
                  {name()}
                </a>
              </Show>
              <Show when={!props.hasLink}>
                <div class="author__name text-3xl text-2xl">{name()}</div>
              </Show>

              <Show when={!props.hideDescription}>
                <div class="author__about">{bio()}</div>
              </Show>
            </div>

            <Show when={canFollow()}>
              <div class="author__subscribe">
                <Show
                  when={subscribed()}
                  fallback={
                    <button onClick={() => follow} class="button button--subscribe">
                      <Icon name="author-subscribe" />
                      <span class="button__label">+&nbsp;{t('Follow')}</span>
                    </button>
                  }
                >
                  <button onClick={() => unfollow} class="button button--subscribe">
                    <Icon name="author-unsubscribe" />
                    <span class="button__label">-&nbsp;{t('Unfollow')}</span>
                  </button>
                </Show>

                <Show when={!props.compact}>
                  <button class="button button--write">
                    <Icon name="edit" />
                    {t('Write')}
                  </button>

                  <For each={props.author.links}>{(link: string) => <a href={link} />}</For>
                </Show>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </>
  )
}
