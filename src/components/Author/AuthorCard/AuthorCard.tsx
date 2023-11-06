import type { Author } from '../../../graphql/types.gen'
import { Userpic } from '../Userpic'
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import { translit } from '../../../utils/ru2en'
import { follow, unfollow } from '../../../stores/zine/common'
import { clsx } from 'clsx'
import { useSession } from '../../../context/session'
import { ShowOnlyOnClient } from '../../_shared/ShowOnlyOnClient'
import { FollowingEntity, Topic } from '../../../graphql/types.gen'
import { router, useRouter } from '../../../stores/router'
import { openPage, redirectPage } from '@nanostores/router'
import { useLocalize } from '../../../context/localize'
import { Modal } from '../../Nav/Modal'
import { SubscriptionFilter } from '../../../pages/types'
import { isAuthor } from '../../../utils/isAuthor'
import { AuthorBadge } from '../AuthorBadge'
import { TopicBadge } from '../../Topic/TopicBadge'
import { Button } from '../../_shared/Button'
import { getShareUrl, SharePopup } from '../../Article/SharePopup'
import styles from './AuthorCard.module.scss'

type Props = {
  author: Author
  followers?: Author[]
  following?: Array<Author | Topic>
}

export const AuthorCard = (props: Props) => {
  const { t, lang } = useLocalize()
  const {
    session,
    subscriptions,
    isSessionLoaded,
    actions: { loadSubscriptions, requireAuthentication }
  } = useSession()

  const [isSubscribing, setIsSubscribing] = createSignal(false)
  const [following, setFollowing] = createSignal<Array<Author | Topic>>(props.following)
  const [subscriptionFilter, setSubscriptionFilter] = createSignal<SubscriptionFilter>('all')

  const subscribed = createMemo<boolean>(() =>
    subscriptions().authors.some((author) => author.slug === props.author.slug)
  )

  const subscribe = async (really = true) => {
    setIsSubscribing(true)

    await (really
      ? follow({ what: FollowingEntity.Author, slug: props.author.slug })
      : unfollow({ what: FollowingEntity.Author, slug: props.author.slug }))

    await loadSubscriptions()
    setIsSubscribing(false)
  }

  const isProfileOwner = createMemo(() => session()?.user?.slug === props.author.slug)

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
      changeSearchParam({
        initChat: props.author.id.toString()
      })
    }, 'discussions')
  }

  const handleSubscribe = () => {
    requireAuthentication(() => {
      subscribe(!subscribed())
    }, 'subscribe')
  }

  createEffect(() => {
    if (props.following) {
      if (subscriptionFilter() === 'users') {
        setFollowing(props.following.filter((s) => 'name' in s))
      } else if (subscriptionFilter() === 'topics') {
        setFollowing(props.following.filter((s) => 'title' in s))
      } else {
        setFollowing(props.following)
      }
    }
  })

  const followButtonText = () => {
    if (isSubscribing()) {
      return t('subscribing...')
    }

    return !subscribed() ? (
      t('Follow')
    ) : (
      <>
        <span class={styles.buttonSubscribeLabel}>{t('Following')}</span>
        <span class={styles.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
      </>
    )
  }

  return (
    <div class={clsx(styles.author, 'row')}>
      <div class="col-md-5">
        <Userpic
          size={'XL'}
          name={props.author.name}
          userpic={props.author.userpic}
          slug={props.author.slug}
          class={styles.circlewrap}
        />
      </div>
      <div class={clsx('col-md-15 col-xl-13', styles.authorDetails)}>
        <div class={styles.authorDetailsWrapper}>
          <div class={styles.authorName}>{name()}</div>
          <div class={styles.authorAbout} innerHTML={props.author.bio} />
          <Show
            when={
              (props.followers && props.followers.length > 0) ||
              (props.following && props.following.length > 0)
            }
          >
            <div class={styles.subscribersContainer}>
              <Show when={props.followers && props.followers.length > 0}>
                <a href="?modal=followers" class={styles.subscribers}>
                  <For each={props.followers.slice(0, 3)}>
                    {(f) => (
                      <Userpic
                        size={'XS'}
                        name={f.name}
                        userpic={f.userpic}
                        class={styles.subscribersItem}
                      />
                    )}
                  </For>
                  <div class={styles.subscribersCounter}>
                    {t('SubscriberWithCount', { count: props.followers.length ?? 0 })}
                  </div>
                </a>
              </Show>

              <Show when={props.following && props.following.length > 0}>
                <a href="?modal=following" class={styles.subscribers}>
                  <For each={props.following.slice(0, 3)}>
                    {(f) => {
                      if ('name' in f) {
                        return (
                          <Userpic
                            size={'XS'}
                            name={f.name}
                            userpic={f.userpic}
                            class={styles.subscribersItem}
                          />
                        )
                      } else if ('title' in f) {
                        return (
                          <Userpic
                            size={'XS'}
                            name={f.title}
                            userpic={f.pic}
                            class={styles.subscribersItem}
                          />
                        )
                      }
                      return null
                    }}
                  </For>
                  <div class={styles.subscribersCounter}>
                    {t('SubscriptionWithCount', { count: props?.following.length ?? 0 })}
                  </div>
                </a>
              </Show>
            </div>
          </Show>
        </div>
        <ShowOnlyOnClient>
          <Show when={isSessionLoaded()}>
            <Show when={props.author.links && props.author.links.length > 0}>
              <div class={styles.authorSubscribeSocial}>
                <For each={props.author.links}>
                  {(link) => (
                    <a
                      class={styles.socialLink}
                      href={link.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="nofollow noopener"
                    >
                      <span class={styles.authorSubscribeSocialLabel}>
                        {link.startsWith('http') ? link : `https://${link}`}
                      </span>
                    </a>
                  )}
                </For>
              </div>
            </Show>

            <Show
              when={isProfileOwner()}
              fallback={
                <div class={styles.authorActions}>
                  <Button
                    onClick={handleSubscribe}
                    value={followButtonText()}
                    class={styles.buttonSubscribe}
                  />
                  <Button
                    variant={'secondary'}
                    value={t('Message')}
                    onClick={initChat}
                    class={styles.buttonWriteMessage}
                  />
                </div>
              }
            >
              <div class={styles.authorActions}>
                <Button
                  variant="secondary"
                  onClick={() => redirectPage(router, 'profileSettings')}
                  value={t('Edit profile')}
                />
                <SharePopup
                  title={props.author.name}
                  description={props.author.bio}
                  imageUrl={props.author.userpic}
                  shareUrl={getShareUrl({ pathname: `/author/${props.author.slug}` })}
                  trigger={<Button variant="secondary" value={t('Share')} />}
                />
              </div>
            </Show>
          </Show>
        </ShowOnlyOnClient>
        <Show when={props.followers}>
          <Modal variant="medium" name="followers" maxHeight>
            <>
              <h2>{t('Followers')}</h2>
              <div class={styles.listWrapper}>
                <div class="row">
                  <div class="col-24">
                    <For each={props.followers}>
                      {(follower: Author) => <AuthorBadge author={follower} />}
                    </For>
                  </div>
                </div>
              </div>
            </>
          </Modal>
        </Show>
        <Show when={props.following}>
          <Modal variant="medium" name="following" maxHeight>
            <>
              <h2>{t('Subscriptions')}</h2>
              <ul class="view-switcher">
                <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'all' })}>
                  <button type="button" onClick={() => setSubscriptionFilter('all')}>
                    {t('All')}
                  </button>
                  <span class="view-switcher__counter">{props.following.length}</span>
                </li>
                <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'users' })}>
                  <button type="button" onClick={() => setSubscriptionFilter('users')}>
                    {t('Users')}
                  </button>
                  <span class="view-switcher__counter">
                    {props.following.filter((s) => 'name' in s).length}
                  </span>
                </li>
                <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'topics' })}>
                  <button type="button" onClick={() => setSubscriptionFilter('topics')}>
                    {t('Topics')}
                  </button>
                  <span class="view-switcher__counter">
                    {props.following.filter((s) => 'title' in s).length}
                  </span>
                </li>
              </ul>
              <br />
              <div class={styles.listWrapper}>
                <div class="row">
                  <div class="col-24">
                    <For each={following()}>
                      {(subscription) =>
                        isAuthor(subscription) ? (
                          <AuthorBadge author={subscription} />
                        ) : (
                          <TopicBadge topic={subscription} />
                        )
                      }
                    </For>
                  </div>
                </div>
              </div>
            </>
          </Modal>
        </Show>
      </div>
    </div>
  )
}
