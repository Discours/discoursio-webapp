import type { Author } from '../../../graphql/types.gen'
import { Userpic } from '../Userpic'
import { Icon } from '../../_shared/Icon'
import styles from './AuthorCard.module.scss'
import { createMemo, createSignal, For, Show, Switch, Match } from 'solid-js'
import { translit } from '../../../utils/ru2en'
import { follow, unfollow } from '../../../stores/zine/common'
import { clsx } from 'clsx'
import { useSession } from '../../../context/session'
import { StatMetrics } from '../../_shared/StatMetrics'
import { ShowOnlyOnClient } from '../../_shared/ShowOnlyOnClient'
import { FollowingEntity } from '../../../graphql/types.gen'
import { router, useRouter } from '../../../stores/router'
import { openPage } from '@nanostores/router'
import { useLocalize } from '../../../context/localize'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'

interface AuthorCardProps {
  caption?: string
  hideWriteButton?: boolean
  hideDescription?: boolean
  hideFollow?: boolean
  hasLink?: boolean
  subscribed?: boolean
  author: Author
  isAuthorPage?: boolean
  noSocialButtons?: boolean
  isAuthorsList?: boolean
  truncateBio?: boolean
  liteButtons?: boolean
  isTextButton?: boolean
  isComments?: boolean
  isFeedMode?: boolean
  isNowrap?: boolean
  class?: string
  followers?: Author[]
}

export const AuthorCard = (props: AuthorCardProps) => {
  const { t, lang } = useLocalize()

  const {
    session,
    isSessionLoaded,
    actions: { loadSession, requireAuthentication }
  } = useSession()

  const [isSubscribing, setIsSubscribing] = createSignal(false)

  const subscribed = createMemo<boolean>(() => {
    return session()?.news?.authors?.some((u) => u === props.author.slug) || false
  })

  const subscribe = async (really = true) => {
    setIsSubscribing(true)

    await (really
      ? follow({ what: FollowingEntity.Author, slug: props.author.slug })
      : unfollow({ what: FollowingEntity.Author, slug: props.author.slug }))

    await loadSession()
    setIsSubscribing(false)
  }

  const canFollow = createMemo(() => !props.hideFollow && session()?.user?.slug !== props.author.slug)

  const name = createMemo(() => {
    if (lang() !== 'ru') {
      if (props.author.name === 'Дискурс') {
        return 'Discours'
      }

      return translit(props.author.name)
    }

    return props.author.name
  })

  // TODO: reimplement AuthorCard
  const { changeSearchParam } = useRouter()
  const initChat = () => {
    requireAuthentication(() => {
      openPage(router, `inbox`)
      changeSearchParam('initChat', `${props.author.id}`)
    }, 'discussions')
  }

  const handleSubscribe = () => {
    requireAuthentication(() => {
      subscribe(true)
    }, 'subscribe')
  }

  return (
    <div
      class={clsx(styles.author, props.class)}
      classList={{
        ['row']: props.isAuthorPage,
        [styles.authorPage]: props.isAuthorPage,
        [styles.authorComments]: props.isComments,
        [styles.authorsListItem]: props.isAuthorsList,
        [styles.feedMode]: props.isFeedMode,
        [styles.nowrapView]: props.isNowrap
      }}
    >
      <Show
        when={props.isAuthorPage}
        fallback={
          <Userpic
            name={props.author.name}
            userpic={props.author.userpic}
            hasLink={props.hasLink}
            isBig={props.isAuthorPage}
            isAuthorsList={props.isAuthorsList}
            isFeedMode={props.isFeedMode}
            class={styles.circlewrap}
          />
        }
      >
        <div class="col-md-5">
          <Userpic
            name={props.author.name}
            userpic={props.author.userpic}
            hasLink={props.hasLink}
            isBig={props.isAuthorPage}
            isAuthorsList={props.isAuthorsList}
            isFeedMode={props.isFeedMode}
            class={styles.circlewrap}
          />
        </div>
      </Show>

      <div
        class={styles.authorDetails}
        classList={{
          'col-md-15 col-xl-13': props.isAuthorPage,
          [styles.authorDetailsShrinked]: props.isAuthorPage
        }}
      >
        <div class={styles.authorDetailsWrapper}>
          <div class={styles.authorNameContainer}>
            <ConditionalWrapper
              condition={props.hasLink}
              wrapper={(children) => (
                <a class={styles.authorName} href={`/author/${props.author.slug}`}>
                  {children}
                </a>
              )}
            >
              <span class={clsx({ [styles.authorName]: !props.hasLink })}>{name()}</span>
            </ConditionalWrapper>
          </div>

          <Show when={props.author.bio}>
            <div
              class={styles.authorAbout}
              classList={{ 'text-truncate': props.truncateBio }}
              innerHTML={props.author.bio}
            />
          </Show>

          <Show when={props.followers}>
            <div>
              <div class={styles.subscribers}>
                <For each={props.followers.slice(0, 3)}>
                  {(f) => <Userpic name={f.name} userpic={f.userpic} class={styles.userpic} />}
                </For>
                <div>{props.followers.length} подписчики</div>
              </div>
            </div>
          </Show>

          <Show when={props.author.stat}>
            <StatMetrics fields={['shouts', 'followers', 'comments']} stat={props.author.stat} />
          </Show>
        </div>
        <ShowOnlyOnClient>
          <Show when={isSessionLoaded()}>
            <Show when={canFollow()}>
              <div class={styles.authorSubscribe}>
                <Show when={!props.noSocialButtons && !props.hideWriteButton}>
                  <div class={styles.authorSubscribeSocial}>
                    <For each={props.author.links}>{(link) => <a href={link} />}</For>
                  </div>
                </Show>

                <Show
                  when={subscribed()}
                  fallback={
                    <button
                      onClick={handleSubscribe}
                      class={clsx('button', styles.button)}
                      classList={{
                        [styles.buttonSubscribe]: !props.isAuthorsList && !props.isTextButton,
                        'button--subscribe': !props.isAuthorsList,
                        'button--subscribe-topic': props.isAuthorsList || props.isTextButton,
                        [styles.buttonWrite]: props.isAuthorsList || props.isTextButton,
                        [styles.isSubscribing]: isSubscribing()
                      }}
                      disabled={isSubscribing()}
                    >
                      <Show when={!props.isAuthorsList && !props.isTextButton && !props.isAuthorPage}>
                        <Icon name="author-subscribe" class={styles.icon} />
                      </Show>
                      <Show when={props.isTextButton || props.isAuthorPage}>
                        <span class={clsx(styles.buttonLabel, styles.buttonLabelVisible)}>
                          {t('Follow')}
                        </span>
                      </Show>
                    </button>
                  }
                >
                  <button
                    onClick={() => subscribe(false)}
                    class={clsx('button', styles.button)}
                    classList={{
                      [styles.buttonSubscribe]: !props.isAuthorsList && !props.isTextButton,
                      'button--subscribe': !props.isAuthorsList,
                      'button--subscribe-topic': props.isAuthorsList || props.isTextButton,
                      [styles.buttonWrite]: props.isAuthorsList || props.isTextButton,
                      [styles.isSubscribing]: isSubscribing()
                    }}
                    disabled={isSubscribing()}
                  >
                    <Show when={!props.isAuthorsList && !props.isTextButton && !props.isAuthorPage}>
                      <Icon name="author-unsubscribe" class={styles.icon} />
                    </Show>
                    <Show when={props.isTextButton || props.isAuthorPage}>
                      <span
                        class={clsx(
                          styles.buttonLabel,
                          styles.buttonLabelVisible,
                          styles.buttonUnfollowLabel
                        )}
                      >
                        {t('Unfollow')}
                      </span>
                      <span
                        class={clsx(
                          styles.buttonLabel,
                          styles.buttonLabelVisible,
                          styles.buttonSubscribedLabel
                        )}
                      >
                        {t('You are subscribed')}
                      </span>
                    </Show>
                  </button>
                </Show>

                <Show when={!props.hideWriteButton}>
                  <button
                    class={styles.button}
                    classList={{
                      [styles.buttonSubscribe]: !props.isAuthorsList,
                      'button--subscribe': !props.isAuthorsList,
                      'button--subscribe-topic': props.isAuthorsList,
                      [styles.buttonWrite]: props.liteButtons && props.isAuthorsList
                    }}
                    onClick={initChat}
                  >
                    <Show when={!props.isTextButton && !props.isAuthorPage}>
                      <Icon name="comment" class={styles.icon} />
                    </Show>
                    <Show when={!props.liteButtons || props.isTextButton}>{t('Write')}</Show>
                  </button>
                </Show>
              </div>
            </Show>
          </Show>
        </ShowOnlyOnClient>
      </div>

      {/*<ul class={clsx('nodash', styles.subscribersList)}>*/}
      {/*  <For each={props.followers}>*/}
      {/*    {(item: Author) => (*/}
      {/*      <li class={styles.subscriber}>*/}
      {/*        <AuthorCard*/}
      {/*          author={item}*/}
      {/*          isNowrap={true}*/}
      {/*          hideDescription={true}*/}
      {/*          hideFollow={true}*/}
      {/*          hasLink={true}*/}
      {/*        />*/}
      {/*      </li>*/}
      {/*    )}*/}
      {/*  </For>*/}
      {/*</ul>*/}
    </div>
  )
}
