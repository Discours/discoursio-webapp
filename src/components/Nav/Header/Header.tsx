import type { Topic } from '../../../graphql/types.gen'

import { getPagePath, redirectPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { Show, createSignal, createEffect, onMount, onCleanup, For } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { router, ROUTES, useRouter } from '../../../stores/router'
import { useModalStore } from '../../../stores/ui'
import { apiClient } from '../../../utils/apiClient'
import { getDescription } from '../../../utils/meta'
import { Icon } from '../../_shared/Icon'
import { Subscribe } from '../../_shared/Subscribe'
import { getShareUrl, SharePopup } from '../../Article/SharePopup'
import { RANDOM_TOPICS_COUNT } from '../../Views/Home'
import { AuthModal } from '../AuthModal'
import { ConfirmModal } from '../ConfirmModal'
import { HeaderAuth } from '../HeaderAuth'
import { Modal } from '../Modal'
import { Snackbar } from '../Snackbar'

import { Link } from './Link'

import styles from './Header.module.scss'

type Props = {
  title?: string
  slug?: string
  isHeaderFixed?: boolean
  articleBody?: string
  cover?: string
  scrollToComments?: (value: boolean) => void
}

type HeaderSearchParams = {
  source?: string
}

const handleSwitchLanguage = (event) => {
  location.href = `${location.href}${location.href.includes('?') ? '&' : '?'}lng=${event.target.value}`
}

export const Header = (props: Props) => {
  const { t, lang } = useLocalize()
  const { modal } = useModalStore()
  const { page } = useRouter()
  const {
    actions: { requireAuthentication },
  } = useSession()

  const { searchParams } = useRouter<HeaderSearchParams>()

  const [randomTopics, setRandomTopics] = createSignal([])
  const [getIsScrollingBottom, setIsScrollingBottom] = createSignal(false)
  const [getIsScrolled, setIsScrolled] = createSignal(false)
  const [fixed, setFixed] = createSignal(false)
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)
  const [isProfilePopupVisible, setIsProfilePopupVisible] = createSignal(false)
  const [isKnowledgeBaseVisible, setIsKnowledgeBaseVisible] = createSignal(false)
  const [isTopicsVisible, setIsTopicsVisible] = createSignal(false)
  const [isZineVisible, setIsZineVisible] = createSignal(false)
  const [isFeedVisible, setIsFeedVisible] = createSignal(false)
  const toggleFixed = () => {
    setFixed(!fixed())
    console.log('!!! toggleFixed:')
  }

  const tag = (topic: Topic) =>
    /[ЁА-яё]/.test(topic.title || '') && lang() !== 'ru' ? topic.slug : topic.title

  let windowScrollTop = 0

  createEffect(() => {
    const mainContent = document.querySelector<HTMLDivElement>('.main-content')

    if (fixed() || modal() !== null) {
      windowScrollTop = window.scrollY
      mainContent.style.marginTop = `-${windowScrollTop}px`
    }

    document.body.classList.toggle('fixed', fixed() || modal() !== null)
    document.body.classList.toggle(styles.fixed, fixed() && !modal())

    if (!fixed() && !modal()) {
      mainContent.style.marginTop = ''
      window.scrollTo(0, windowScrollTop)
    }
  })

  onMount(() => {
    let scrollTop = window.scrollY

    const handleScroll = () => {
      setIsScrollingBottom(window.scrollY > scrollTop)
      setIsScrolled(window.scrollY > 0)
      scrollTop = window.scrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  })

  const scrollToComments = (event, value) => {
    event.preventDefault()
    props.scrollToComments(value)
  }

  const handleBookmarkButtonClick = (ev) => {
    requireAuthentication(() => {
      // TODO: implement bookmark clicked
      ev.preventDefault()
    }, 'bookmark')
  }

  const handleCreateButtonClick = (ev) => {
    requireAuthentication(() => {
      ev.preventDefault()

      redirectPage(router, 'create')
    }, 'create')
  }

  const toggleSubnavigation = (isShow, signal?) => {
    clearTimer()
    setIsKnowledgeBaseVisible(false)
    setIsTopicsVisible(false)
    setIsZineVisible(false)
    setIsFeedVisible(false)

    if (signal) {
      signal(isShow)
    }
  }

  let timer

  const clearTimer = () => {
    clearTimeout(timer)
  }

  createEffect(() => {
    console.log('!!! mo:', modal())
  })
  const hideSubnavigation = (event, time = 500) => {
    timer = setTimeout(() => {
      toggleSubnavigation(false)
    }, time)
  }

  onMount(async () => {
    const topics = await apiClient.getRandomTopics({ amount: RANDOM_TOPICS_COUNT })
    setRandomTopics(topics)
  })

  const handleToggleMenuByLink = (event: MouseEvent, route: keyof typeof ROUTES) => {
    if (!fixed()) {
      return
    }
    event.preventDefault()
    if (page().route === route) {
      toggleFixed()
    }
  }
  return (
    <header
      class={styles.mainHeader}
      classList={{
        [styles.headerFixed]: props.isHeaderFixed,
        [styles.headerScrolledTop]: !getIsScrollingBottom() && getIsScrolled(),
        [styles.headerScrolledBottom]:
          (getIsScrollingBottom() && getIsScrolled() && !isProfilePopupVisible()) || isSharePopupVisible(),
        [styles.headerWithTitle]: Boolean(props.title),
      }}
    >
      <Modal
        variant={searchParams().source ? 'narrow' : 'wide'}
        name="auth"
        allowClose={searchParams().source !== 'authguard'}
        noPadding={true}
      >
        <AuthModal />
      </Modal>

      <Modal variant="narrow" name="confirm">
        <ConfirmModal />
      </Modal>

      <div class={clsx(styles.mainHeaderInner, 'wide-container')}>
        <nav class={clsx('row', styles.headerInner, { [styles.fixed]: fixed() })}>
          <div class={clsx(styles.burgerContainer, 'col-auto')}>
            <div class={clsx(styles.burger, { [styles.fixed]: fixed() })} onClick={toggleFixed}>
              <div />
            </div>
          </div>
          <div class={clsx('col-md-5 col-xl-4 col-auto', styles.mainLogo)}>
            <a href={getPagePath(router, 'home')}>
              <img src="/logo.svg" alt={t('Discours')} />
            </a>
          </div>
          <div class={clsx('col col-md-13 col-lg-12 offset-xl-1', styles.mainNavigationWrapper)}>
            <Show when={props.title}>
              <div class={styles.articleHeader}>{props.title}</div>
            </Show>
            <div class={clsx(styles.mainNavigation, { [styles.fixed]: fixed() })}>
              <ul class="view-switcher">
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsZineVisible)}
                  onMouseOut={() => hideSubnavigation}
                  routeName="home"
                  active={isZineVisible()}
                  body={t('journal')}
                  onClick={(event) => handleToggleMenuByLink(event, 'home')}
                />
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsFeedVisible)}
                  onMouseOut={() => hideSubnavigation}
                  routeName="feed"
                  active={isFeedVisible()}
                  body={t('feed')}
                  onClick={(event) => handleToggleMenuByLink(event, 'feed')}
                />
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsTopicsVisible)}
                  onMouseOut={() => hideSubnavigation}
                  routeName="topics"
                  active={isTopicsVisible()}
                  body={t('topics')}
                  onClick={(event) => handleToggleMenuByLink(event, 'topics')}
                />
                <Link
                  onMouseOver={(event) => hideSubnavigation(event, 0)}
                  onMouseOut={(event) => hideSubnavigation(event, 0)}
                  routeName="authors"
                  body={t('authors')}
                  onClick={(event) => handleToggleMenuByLink(event, 'authors')}
                />
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsKnowledgeBaseVisible)}
                  onMouseOut={() => hideSubnavigation}
                  routeName="guide"
                  body={t('Knowledge base')}
                  active={isKnowledgeBaseVisible()}
                  onClick={(event) => handleToggleMenuByLink(event, 'guide')}
                />
              </ul>

              <div class={styles.mainNavigationMobile}>
                <h4>{t('Participating')}</h4>
                <ul class="view-switcher">
                  <li>
                    <a href="/create">{t('Create post')}</a>
                  </li>
                  <li>
                    <a href="/connect">{t('Suggest an idea')}</a>
                  </li>
                  <li>
                    <a href="/about/help">{t('Support the project')}</a>
                  </li>
                </ul>

                <h4 innerHTML={t('Subscribe us')} />
                <ul class="view-switcher">
                  <li class={styles.mainNavigationSocial}>
                    <a href="https://www.instagram.com/discoursio/">
                      <Icon name="user-link-instagram" class={styles.icon} />
                      Instagram
                    </a>
                  </li>
                  <li class={styles.mainNavigationSocial}>
                    <a href="https://facebook.com/discoursio">
                      <Icon name="user-link-facebook" class={styles.icon} />
                      Facebook
                    </a>
                  </li>
                  <li class={styles.mainNavigationSocial}>
                    <a href="https://twitter.com/discours_io">
                      <Icon name="user-link-twitter" class={styles.icon} />
                      Twitter
                    </a>
                  </li>
                  <li class={styles.mainNavigationSocial}>
                    <a href="https://t.me/discoursio">
                      <Icon name="user-link-telegram" class={styles.icon} />
                      Telegram
                    </a>
                  </li>
                  <li class={styles.mainNavigationSocial}>
                    <a href="https://dzen.ru/discoursio">
                      <Icon name="user-link-dzen" class={styles.icon} />
                      Dzen
                    </a>
                  </li>
                  <li class={styles.mainNavigationSocial}>
                    <a href="https://vk.com/discoursio">
                      <Icon name="user-link-vk" class={styles.icon} />
                      VK
                    </a>
                  </li>
                </ul>

                <h4>{t('Newsletter')}</h4>
                <Subscribe variant={'mobileSubscription'} />

                <h4>{t('Language')}</h4>
                <select
                  class={styles.languageSelectorMobile}
                  onChange={handleSwitchLanguage}
                  value={lang()}
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>

                <div class={styles.mainNavigationAdditionalLinks}>
                  <a href="/about/dogma">{t('Dogma')}</a>
                  <a href="/about/discussion-rules" innerHTML={t('Discussion rules')} />
                  <a href="/about/principles">{t('Principles')}</a>
                </div>

                <p
                  class={styles.mobileDescription}
                  innerHTML={t(
                    'Independant magazine with an open horizontal cooperation about culture, science and society',
                  )}
                />
                <div class={styles.mobileCopyright}>
                  {t('Discours')} &copy; 2015&ndash;{new Date().getFullYear()}{' '}
                </div>
              </div>
            </div>
          </div>
          <HeaderAuth setIsProfilePopupVisible={setIsProfilePopupVisible} />
          <Show when={props.title}>
            <div class={clsx(styles.articleControls, 'col-auto')}>
              <SharePopup
                title={props.title}
                imageUrl={props.cover}
                shareUrl={getShareUrl()}
                description={getDescription(props.articleBody)}
                onVisibilityChange={(isVisible) => {
                  setIsSharePopupVisible(isVisible)
                }}
                containerCssClass={styles.control}
                trigger={
                  <>
                    <Icon name="share-outline" class={styles.icon} />
                    <Icon name="share-outline-hover" class={clsx(styles.icon, styles.iconHover)} />
                  </>
                }
              />
              <div onClick={(event) => scrollToComments(event, true)} class={styles.control}>
                <Icon name="comment" class={styles.icon} />
                <Icon name="comment-hover" class={clsx(styles.icon, styles.iconHover)} />
              </div>
              <a href="#" class={styles.control} onClick={handleCreateButtonClick}>
                <Icon name="pencil-outline" class={styles.icon} />
                <Icon name="pencil-outline-hover" class={clsx(styles.icon, styles.iconHover)} />
              </a>
              <a href="#" class={styles.control} onClick={handleBookmarkButtonClick}>
                <Icon name="bookmark" class={styles.icon} />
                <Icon name="bookmark-hover" class={clsx(styles.icon, styles.iconHover)} />
              </a>
            </div>
          </Show>

          <div
            class={clsx(styles.subnavigation, 'col')}
            classList={{ hidden: !isKnowledgeBaseVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
          >
            <ul class="nodash">
              <li>
                <a href="/about/manifest">{t('Manifesto')}</a>
              </li>
              <li>
                <a href="/about/dogma">{t('Dogma')}</a>
              </li>
              <li>
                <a href="/about/principles">{t('Community Principles')}</a>
              </li>
              <li>
                <a href="/about/guide">{t('Platform Guide')}</a>
              </li>
              <li>
                <a href="/about/manifest#participation">{t('Support us')}</a>
              </li>
              <li>
                <a href="/about/help">{t('How to help')}</a>
              </li>
              <li class={styles.rightItem}>
                <a href="/connect">
                  {t('Suggest an idea')}
                  <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                </a>
              </li>
            </ul>
          </div>

          <div
            class={clsx(styles.subnavigation, 'col')}
            classList={{ hidden: !isZineVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
          >
            <ul class="nodash">
              <li class="item">
                <a href="/expo">{t('Art')}</a>
              </li>
              <li class="item">
                <a href="/podcasts">{t('Podcasts')}</a>
              </li>
              <li class="item">
                <a href="">{t('Special Projects')}</a>
              </li>
              <li>
                <a href="/topic/interview">#{t('Interview')}</a>
              </li>
              <li>
                <a href="/topic/reportage">#{t('Reports')}</a>
              </li>
              <li>
                <a href="/topic/empiric">#{t('Experience')}</a>
              </li>
              <li>
                <a href="/topic/society">#{t('Society')}</a>
              </li>
              <li>
                <a href="/topic/culture">#{t('Culture')}</a>
              </li>
              <li>
                <a href="/topic/theory">#{t('Theory')}</a>
              </li>
              <li>
                <a href="/topic/poetry">#{t('Poetry')}</a>
              </li>
              <li class={styles.rightItem}>
                <a href="/topics">
                  {t('All topics')}
                  <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                </a>
              </li>
            </ul>
          </div>

          <div
            class={clsx(styles.subnavigation, 'col')}
            classList={{ hidden: !isTopicsVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
          >
            <ul class="nodash">
              <Show when={randomTopics().length > 0}>
                <For each={randomTopics()}>
                  {(topic) => (
                    <li class="item">
                      <a href={`/topic/${topic.slug}`}>
                        <span>#{tag(topic)}</span>
                      </a>
                    </li>
                  )}
                </For>
                <li class={styles.rightItem}>
                  <a href="/topics">
                    {t('All topics')}
                    <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                  </a>
                </li>
              </Show>
            </ul>
          </div>

          <div
            class={clsx(styles.subnavigation, styles.subnavigationFeed, 'col')}
            classList={{ hidden: !isFeedVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
          >
            <ul class="nodash">
              <li>
                <a href={getPagePath(router, 'feed')}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-all" class={styles.icon} />
                    {t('All')}
                  </span>
                </a>
              </li>

              <li>
                <a href={getPagePath(router, 'feedMy')}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-my" class={styles.icon} />
                    {t('My feed')}
                  </span>
                </a>
              </li>
              <li>
                <a href={getPagePath(router, 'feedCollaborations')}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-collaborate" class={styles.icon} />
                    {t('Participation')}
                  </span>
                </a>
              </li>
              <li>
                <a href={getPagePath(router, 'feedDiscussions')}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-discussion" class={styles.icon} />
                    {t('Discussions')}
                  </span>
                </a>
              </li>
              <li>
                <a href={getPagePath(router, 'feedBookmarks')}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="bookmark" class={styles.icon} />
                    {t('Bookmarks')}
                  </span>
                </a>
              </li>
              <li>
                <a href={getPagePath(router, 'feedNotifications')}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-notifications" class={styles.icon} />
                    {t('Notifications')}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <Snackbar />
      </div>
    </header>
  )
}
