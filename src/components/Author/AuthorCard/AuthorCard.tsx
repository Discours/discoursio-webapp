import type { Author } from '../../../graphql/types.gen'
import { Userpic } from '../Userpic'
import { Icon } from '../../_shared/Icon'
import styles from './AuthorCard.module.scss'
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import { translit } from '../../../utils/ru2en'
import { follow, unfollow } from '../../../stores/zine/common'
import { clsx } from 'clsx'
import { useSession } from '../../../context/session'
import { ShowOnlyOnClient } from '../../_shared/ShowOnlyOnClient'
import { FollowingEntity, Topic } from '../../../graphql/types.gen'
import { router, useRouter } from '../../../stores/router'
import { openPage } from '@nanostores/router'
import { useLocalize } from '../../../context/localize'
import { ConditionalWrapper } from '../../_shared/ConditionalWrapper'
import { Modal } from '../../Nav/Modal'
import { showModal } from '../../../stores/ui'
import { TopicCard } from '../../Topic/Card'
import { getNumeralsDeclension } from '../../../utils/getNumeralsDeclension'

type SubscriptionFilter = 'all' | 'users' | 'topics'
type Props = {
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
  subscriptions?: Array<Author | Topic>
  showPublicationsCounter?: boolean
}

function isAuthor(value: Author | Topic): value is Author {
  return 'name' in value
}

export const AuthorCard = (props: Props) => {
  const { t, lang } = useLocalize()

  const {
    session,
    isSessionLoaded,
    actions: { loadSession, requireAuthentication }
  } = useSession()

  const [isSubscribing, setIsSubscribing] = createSignal(false)
  const [subscriptions, setSubscriptions] = createSignal<Array<Author | Topic>>(props.subscriptions)
  const [subscriptionFilter, setSubscriptionFilter] = createSignal<SubscriptionFilter>('all')
  const [userpicUrl, setUserpicUrl] = createSignal<string>()

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

  createEffect(() => {
    if (props.subscriptions) {
      if (subscriptionFilter() === 'users') {
        setSubscriptions(props.subscriptions.filter((s) => 'name' in s))
      } else if (subscriptionFilter() === 'topics') {
        setSubscriptions(props.subscriptions.filter((s) => 'title' in s))
      } else {
        setSubscriptions(props.subscriptions)
      }
    }
  })

  if (props.isAuthorPage && props.author.userpic.includes('assets.discours.io')) {
    setUserpicUrl(props.author.userpic.replace('100x', '500x500'))
  }

  return (
    <>
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
              userpic={userpicUrl()}
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
            {/*TODO: implement plurals by i18n*/}
            <Show
              when={props.author.bio}
              fallback={
                props.showPublicationsCounter ? (
                  <div class={styles.authorAbout}>{props.author.stat?.shouts} публикаций</div>
                ) : (
                  ''
                )
              }
            >
              <div
                class={styles.authorAbout}
                classList={{ 'text-truncate': props.truncateBio }}
                innerHTML={props.author.bio}
              />
            </Show>

            <Show
              when={
                (props.followers && props.followers.length > 0) ||
                (props.subscriptions && props.subscriptions.length > 0)
              }
            >
              <div class={styles.subscribersContainer}>
                <Show when={props.followers && props.followers.length > 0}>
                  <div class={styles.subscribers} onClick={() => showModal('followers')}>
                    <For each={props.followers.slice(0, 3)}>
                      {(f) => <Userpic name={f.name} userpic={f.userpic} class={styles.userpic} />}
                    </For>
                    <div class={styles.subscribersCounter}>
                      {props.followers.length}&nbsp;
                      {getNumeralsDeclension(props.followers.length, [
                        t('subscriber'),
                        t('subscriber_rp'),
                        t('subscribers')
                      ])}
                    </div>
                  </div>
                </Show>
                <Show when={props.subscriptions && props.subscriptions.length > 0}>
                  <div class={styles.subscribers} onClick={() => showModal('subscriptions')}>
                    <For each={props.subscriptions.slice(0, 3)}>
                      {(f) => {
                        if ('name' in f) {
                          return <Userpic name={f.name} userpic={f.userpic} class={styles.userpic} />
                        } else if ('title' in f) {
                          return <Userpic name={f.title} userpic={f.pic} class={styles.userpic} />
                        }
                        return null
                      }}
                    </For>
                    <div class={styles.subscribersCounter}>
                      {props.subscriptions.length}&nbsp;
                      {getNumeralsDeclension(props.subscriptions.length, [
                        t('subscription'),
                        t('subscription_rp'),
                        t('subscriptions')
                      ])}
                    </div>
                  </div>
                </Show>
              </div>
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
      </div>

      <Show when={props.followers}>
        <Modal variant="wide" name="followers" maxHeight>
          <>
            <h2>{t('Followers')}</h2>
            <div class={styles.listWrapper}>
              <div class="row">
                <div class="col-24">
                  <For each={props.followers}>
                    {(follower: Author) => (
                      <AuthorCard
                        author={follower}
                        hideWriteButton={true}
                        hasLink={true}
                        isTextButton={true}
                        liteButtons={true}
                        truncateBio={true}
                        showPublicationsCounter={true}
                      />
                    )}
                  </For>
                </div>
              </div>
            </div>
          </>
        </Modal>
      </Show>

      <Show when={props.subscriptions}>
        <Modal variant="wide" name="subscriptions" maxHeight>
          <>
            <h2>{t('Subscriptions')}</h2>
            <ul class="view-switcher">
              <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'all' })}>
                <button type="button" onClick={() => setSubscriptionFilter('all')}>
                  {t('All')}
                </button>
                <span class={styles.switcherCounter}>{props.subscriptions.length}</span>
              </li>
              <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'users' })}>
                <button type="button" onClick={() => setSubscriptionFilter('users')}>
                  {t('Users')}
                </button>
                <span class={styles.switcherCounter}>
                  {props.subscriptions.filter((s) => 'name' in s).length}
                </span>
              </li>
              <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'topics' })}>
                <button type="button" onClick={() => setSubscriptionFilter('topics')}>
                  {t('Topics')}
                </button>
                <span class={styles.switcherCounter}>
                  {props.subscriptions.filter((s) => 'title' in s).length}
                </span>
              </li>
            </ul>
            <br />
            <div class={styles.listWrapper}>
              <div class="row">
                <div class="col-24">
                  <For each={subscriptions()}>
                    {(subscription: Author | Topic) =>
                      isAuthor(subscription) ? (
                        <AuthorCard
                          author={subscription}
                          hideWriteButton={true}
                          hasLink={true}
                          isTextButton={true}
                          truncateBio={true}
                          showPublicationsCounter={true}
                        />
                      ) : (
                        <TopicCard compact isTopicInRow showDescription isCardMode topic={subscription} />
                      )
                    }
                  </For>
                </div>
              </div>
            </div>
          </>
        </Modal>
      </Show>
    </>
  )
}
