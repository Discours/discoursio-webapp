import type { Author, Community } from '~/graphql/schema/core.gen'

import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js'
import { Button } from '~/components/_shared/Button'
import { FollowingCounters } from '~/components/_shared/FollowingCounters/FollowingCounters'
import { ShowOnlyOnClient } from '~/components/_shared/ShowOnlyOnClient'
import { FollowsFilter, useFollowing } from '~/context/following'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { FollowingEntity, Topic } from '~/graphql/schema/core.gen'
import { isCyrillic } from '~/intl/translate'
import { translit } from '~/intl/translit'
import { SharePopup, getShareUrl } from '../../Article/SharePopup'
import { Modal } from '../../Nav/Modal'
import { TopicBadge } from '../../Topic/TopicBadge'
import { AuthorBadge } from '../AuthorBadge'
import { Userpic } from '../Userpic'

import { useNavigate, useSearchParams } from '@solidjs/router'
import stylesButton from '~/components/_shared/Button/Button.module.scss'
import styles from './AuthorCard.module.scss'

type Props = {
  author: Author
  followers?: Author[]
  flatFollows?: Array<Author | Topic>
}

export const AuthorCard = (props: Props) => {
  const { t, lang } = useLocalize()
  const navigate = useNavigate()
  const { session, isSessionLoaded, requireAuthentication } = useSession()
  const author = createMemo<Author>(() => session()?.user?.app_data?.profile as Author)
  const [authorSubs, setAuthorSubs] = createSignal<Array<Author | Topic | Community>>([])
  const [followsFilter, setFollowsFilter] = createSignal<FollowsFilter>('all')
  const [isFollowed, setIsFollowed] = createSignal<boolean>()
  const isProfileOwner = createMemo(() => author()?.slug === props.author.slug)
  const { follow, unfollow, follows, following } = useFollowing()

  onMount(() => {
    setAuthorSubs(props.flatFollows || [])
  })

  createEffect(() => {
    if (!(follows && props.author)) return
    const followed = follows?.authors?.some((authorEntity) => authorEntity.id === props.author?.id)
    setIsFollowed(followed)
  })

  const name = createMemo(() => {
    if (lang() !== 'ru' && isCyrillic(props.author?.name || '')) {
      if (props.author.name === 'Дискурс') {
        return 'Discours'
      }
      return translit(props.author?.name || '')
    }
    return props.author.name
  })

  const [, changeSearchParams] = useSearchParams()
  const initChat = () => {
    // eslint-disable-next-line solid/reactivity
    requireAuthentication(() => {
      navigate('/inbox')
      changeSearchParams({
        initChat: props.author?.id.toString()
      })
    }, 'discussions')
  }

  createEffect(() => {
    if (props.flatFollows) {
      if (followsFilter() === 'authors') {
        setAuthorSubs(props.flatFollows.filter((s) => 'name' in s))
      } else if (followsFilter() === 'topics') {
        setAuthorSubs(props.flatFollows.filter((s) => 'title' in s))
      } else if (followsFilter() === 'communities') {
        setAuthorSubs(props.flatFollows.filter((s) => 'title' in s))
      } else {
        setAuthorSubs(props.flatFollows)
      }
    }
  })

  const handleFollowClick = () => {
    requireAuthentication(() => {
      isFollowed()
        ? unfollow(FollowingEntity.Author, props.author.slug)
        : follow(FollowingEntity.Author, props.author.slug)
    }, 'follow')
  }

  const followButtonText = createMemo(() => {
    if (following()?.slug === props.author.slug) {
      return following()?.type === 'follow' ? t('Following...') : t('Unfollowing...')
    }

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

  const FollowersModalView = () => (
    <>
      <h2>{t('Followers')}</h2>
      <div class={styles.listWrapper}>
        <div class="row">
          <div class="col-24">
            <For each={props.followers}>{(follower: Author) => <AuthorBadge author={follower} />}</For>
          </div>
        </div>
      </div>
    </>
  )

  const FollowingModalView = () => (
    <>
      <h2>{t('Subscriptions')}</h2>
      <ul class="view-switcher">
        <li
          class={clsx({
            'view-switcher__item--selected': followsFilter() === 'all'
          })}
        >
          <button type="button" onClick={() => setFollowsFilter('all')}>
            {t('All')}
          </button>
          <span class="view-switcher__counter">{props.flatFollows?.length}</span>
        </li>
        <li
          class={clsx({
            'view-switcher__item--selected': followsFilter() === 'authors'
          })}
        >
          <button type="button" onClick={() => setFollowsFilter('authors')}>
            {t('Authors')}
          </button>
          <span class="view-switcher__counter">{props.flatFollows?.filter((s) => 'name' in s).length}</span>
        </li>
        <li
          class={clsx({
            'view-switcher__item--selected': followsFilter() === 'topics'
          })}
        >
          <button type="button" onClick={() => setFollowsFilter('topics')}>
            {t('Topics')}
          </button>
          <span class="view-switcher__counter">
            {props.flatFollows?.filter((s) => 'title' in s).length}
          </span>
        </li>
      </ul>
      <br />
      <div class={styles.listWrapper}>
        <div class="row">
          <div class="col-24">
            <For each={authorSubs()}>
              {(subscription) =>
                'name' in subscription ? (
                  <AuthorBadge author={subscription as Author} subscriptionsMode={true} />
                ) : (
                  <TopicBadge topic={subscription as Topic} subscriptionsMode={true} />
                )
              }
            </For>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div class={clsx(styles.author, 'row')}>
      <div class="col-md-5">
        <Userpic
          size={'XL'}
          name={props.author.name || ''}
          userpic={props.author.pic || ''}
          slug={props.author.slug}
          class={styles.circlewrap}
        />
      </div>
      <div class={clsx('col-md-15 col-xl-13', styles.authorDetails)}>
        <div class={styles.authorDetailsWrapper}>
          <div class={styles.authorName}>{name()}</div>
          <Show when={props.author.bio}>
            <div class={styles.authorAbout} innerHTML={props.author.bio || ''} />
          </Show>
          <Show when={(props.followers || [])?.length > 0 || (props.flatFollows || []).length > 0}>
            <div class={styles.subscribersContainer}>
              <FollowingCounters
                followers={props.followers}
                followersAmount={props.author?.stat?.followers || 0}
                following={props.flatFollows}
                followingAmount={props.flatFollows?.length || 0}
              />
            </div>
          </Show>
        </div>
        <ShowOnlyOnClient>
          <Show when={isSessionLoaded()}>
            <Show when={props.author.links && props.author.links.length > 0}>
              <div class={styles.authorSubscribeSocial}>
                <For each={props.author.links}>
                  {(link: string | null) => (
                    <a
                      class={styles.socialLink}
                      href={link?.startsWith('http') ? link : `https://${link}`}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                    >
                      <span class={styles.authorSubscribeSocialLabel}>
                        {link?.startsWith('http') ? link : `https://${link}`}
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
                  <Show when={authorSubs()?.length}>
                    <Button
                      onClick={handleFollowClick}
                      disabled={Boolean(following())}
                      value={followButtonText()}
                      isSubscribeButton={true}
                      class={clsx({
                        [stylesButton.followed]: isFollowed()
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
                  onClick={() => navigate('/profile')}
                  value={
                    <>
                      <span class={styles.authorActionsLabel}>{t('Edit profile')}</span>
                      <span class={styles.authorActionsLabelMobile}>{t('Edit')}</span>
                    </>
                  }
                />
                <SharePopup
                  title={props.author.name || ''}
                  description={props.author.bio || ''}
                  imageUrl={props.author.pic || ''}
                  shareUrl={getShareUrl({
                    pathname: `/author/${props.author.slug}`
                  })}
                  trigger={<Button variant="secondary" value={t('Share')} />}
                />
              </div>
            </Show>
          </Show>
        </ShowOnlyOnClient>
        <Show when={props.followers}>
          <Modal variant="medium" isResponsive={true} name="followers" maxHeight>
            <FollowersModalView />
          </Modal>
        </Show>
        <Show when={props.flatFollows}>
          <Modal variant="medium" isResponsive={true} name="following" maxHeight>
            <FollowingModalView />
          </Modal>
        </Show>
      </div>
    </div>
  )
}
