import type { Author, Community } from '../../../graphql/schema/core.gen'

import { openPage, redirectPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, on, onMount } from 'solid-js'

import { useFollowing } from '../../../context/following'
import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { FollowingEntity, Topic } from '../../../graphql/schema/core.gen'
import { SubscriptionFilter } from '../../../pages/types'
import { router, useRouter } from '../../../stores/router'
import { isAuthor } from '../../../utils/isAuthor'
import { translit } from '../../../utils/ru2en'
import { isCyrillic } from '../../../utils/translate'
import { SharePopup, getShareUrl } from '../../Article/SharePopup'
import { Modal } from '../../Nav/Modal'
import { TopicBadge } from '../../Topic/TopicBadge'
import { Button } from '../../_shared/Button'
import { ShowOnlyOnClient } from '../../_shared/ShowOnlyOnClient'
import { AuthorBadge } from '../AuthorBadge'
import { Userpic } from '../Userpic'

import stylesButton from '../../_shared/Button/Button.module.scss'
import styles from './AuthorCard.module.scss'

type Props = {
  author: Author
  followers?: Author[]
  following?: Array<Author | Topic>
}
export const AuthorCard = (props: Props) => {
  const { t, lang } = useLocalize()
  const { author, isSessionLoaded, requireAuthentication } = useSession()
  const { setFollowing } = useFollowing()
  const [authorSubs, setAuthorSubs] = createSignal<Array<Author | Topic | Community>>([])
  const [subscriptionFilter, setSubscriptionFilter] = createSignal<SubscriptionFilter>('all')
  const [isFollowed, setIsFollowed] = createSignal<boolean>()
  const isProfileOwner = createMemo(() => author()?.slug === props.author.slug)
  const isSubscribed = () => props.followers?.some((entity) => entity.id === author()?.id)

  createEffect(
    on(
      () => props.followers,
      () => {
        setIsFollowed(isSubscribed())
      },
      { defer: true },
    ),
  )

  const name = createMemo(() => {
    if (lang() !== 'ru' && isCyrillic(props.author.name)) {
      if (props.author.name === 'Дискурс') {
        return 'Discours'
      }

      return translit(props.author.name)
    }

    return props.author.name
  })

  onMount(() => setAuthorSubs(props.following))

  // TODO: reimplement AuthorCard
  const { changeSearchParams } = useRouter()
  const initChat = () => {
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      openPage(router, `inbox`)
      changeSearchParams({
        initChat: props.author.id.toString(),
      })
    }, 'discussions')
  }

  createEffect(() => {
    if (props.following) {
      if (subscriptionFilter() === 'authors') {
        setAuthorSubs(props.following.filter((s) => 'name' in s))
      } else if (subscriptionFilter() === 'topics') {
        setAuthorSubs(props.following.filter((s) => 'title' in s))
      } else if (subscriptionFilter() === 'communities') {
        setAuthorSubs(props.following.filter((s) => 'title' in s))
      } else {
        setAuthorSubs(props.following)
      }
    }
  })

  const handleFollowClick = () => {
    const value = !isFollowed()
    requireAuthentication(() => {
      setIsFollowed(value)
      setFollowing(FollowingEntity.Author, props.author.slug, value)
    }, 'subscribe')
  }

  const followButtonText = createMemo(() => {
    if (isFollowed()) {
      return (
        <>
          <span class={stylesButton.buttonSubscribeLabel}>{t('Following')}</span>
          <span class={stylesButton.buttonSubscribeLabelHovered}>{t('Unfollow')}</span>
        </>
      )
    }

    return t('Follow')
  })

  return (
    <div class={clsx(styles.author, 'row')}>
      <div class="col-md-5">
        <Userpic
          size={'XL'}
          name={props.author.name}
          userpic={props.author.pic}
          slug={props.author.slug}
          class={styles.circlewrap}
        />
      </div>
      <div class={clsx('col-md-15 col-xl-13', styles.authorDetails)}>
        <div class={styles.authorDetailsWrapper}>
          <div class={styles.authorName}>{name()}</div>
          <Show when={props.author.bio}>
            <div class={styles.authorAbout} innerHTML={props.author.bio} />
          </Show>
          <Show
            when={
              (props.followers && props.followers.length > 0) ||
              (props.following && props.following.length > 0)
            }
          >
            <div class={styles.subscribersContainer}>
              <Show when={props.followers && props.followers.length > 0}>
                <a href="?m=followers" class={styles.subscribers}>
                  <For each={props.followers.slice(0, 3)}>
                    {(f) => (
                      <Userpic size={'XS'} name={f.name} userpic={f.pic} class={styles.subscribersItem} />
                    )}
                  </For>
                  <div class={styles.subscribersCounter}>
                    {t('SubscriberWithCount', { count: props.followers.length ?? 0 })}
                  </div>
                </a>
              </Show>

              <Show when={props.following && props.following.length > 0}>
                <a href="?m=following" class={styles.subscribers}>
                  <For each={props.following.slice(0, 3)}>
                    {(f) => {
                      if ('name' in f) {
                        return (
                          <Userpic
                            size={'XS'}
                            name={f.name}
                            userpic={f.pic}
                            class={styles.subscribersItem}
                          />
                        )
                      }

                      if ('title' in f) {
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
                      rel="nofollow noopener noreferrer"
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
                  <Show when={isFollowed()}>
                    <Button
                      onClick={handleFollowClick}
                      value={followButtonText()}
                      isSubscribeButton={true}
                      class={clsx({
                        [stylesButton.subscribed]: isFollowed(),
                      })}
                    />
                  </Show>
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
                  value={
                    <>
                      <span class={styles.authorActionsLabel}>{t('Edit profile')}</span>
                      <span class={styles.authorActionsLabelMobile}>{t('Edit')}</span>
                    </>
                  }
                />
                <SharePopup
                  title={props.author.name}
                  description={props.author.bio}
                  imageUrl={props.author.pic}
                  shareUrl={getShareUrl({ pathname: `/author/${props.author.slug}` })}
                  trigger={<Button variant="secondary" value={t('Share')} />}
                />
              </div>
            </Show>
          </Show>
        </ShowOnlyOnClient>
        <Show when={props.followers}>
          <Modal variant="medium" isResponsive={true} name="followers" maxHeight>
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
          <Modal variant="medium" isResponsive={true} name="following" maxHeight>
            <>
              <h2>{t('Subscriptions')}</h2>
              <ul class="view-switcher">
                <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'all' })}>
                  <button type="button" onClick={() => setSubscriptionFilter('all')}>
                    {t('All')}
                  </button>
                  <span class="view-switcher__counter">{props.following.length}</span>
                </li>
                <li class={clsx({ 'view-switcher__item--selected': subscriptionFilter() === 'authors' })}>
                  <button type="button" onClick={() => setSubscriptionFilter('authors')}>
                    {t('Authors')}
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
                    <For each={authorSubs()}>
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
