import { Show, createSignal, createEffect, onMount, onCleanup } from 'solid-js'
import { getPagePath, redirectPage } from '@nanostores/router'
import { clsx } from 'clsx'

import { Modal } from './Modal'
import { AuthModal } from './AuthModal'
import { HeaderAuth } from './HeaderAuth'
import { ConfirmModal } from './ConfirmModal'
import { getShareUrl, SharePopup } from '../Article/SharePopup'
import { Snackbar } from './Snackbar'
import { Icon } from '../_shared/Icon'

import { useModalStore } from '../../stores/ui'
import { router, useRouter } from '../../stores/router'

import { getDescription } from '../../utils/meta'

import { useLocalize } from '../../context/localize'
import { useSession } from '../../context/session'

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

export const Header = (props: Props) => {
  const { t } = useLocalize()

  const { modal } = useModalStore()

  const {
    actions: { requireAuthentication }
  } = useSession()

  const { page, searchParams } = useRouter<HeaderSearchParams>()

  const [getIsScrollingBottom, setIsScrollingBottom] = createSignal(false)
  const [getIsScrolled, setIsScrolled] = createSignal(false)
  const [fixed, setFixed] = createSignal(false)
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)
  const [isProfilePopupVisible, setIsProfilePopupVisible] = createSignal(false)
  const [isKnowledgeBaseVisible, setIsKnowledgeBaseVisible] = createSignal(false)
  const [isTopicsVisible, setIsTopicsVisible] = createSignal(false)
  const [isZineVisible, setIsZineVisible] = createSignal(false)
  const [isFeedVisible, setIsFeedVisible] = createSignal(false)

  const toggleFixed = () => setFixed((oldFixed) => !oldFixed)

  let windowScrollTop = 0

  createEffect(() => {
    const mainContent = document.querySelector('.main-content') as HTMLDivElement

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

  const toggleSubnavigation = (isShow, signal) => {
    setIsKnowledgeBaseVisible(false)
    setIsTopicsVisible(false)
    setIsZineVisible(false)
    setIsFeedVisible(false)
    signal(isShow)
  }

  return (
    <header
      class={styles.mainHeader}
      classList={{
        [styles.headerFixed]: props.isHeaderFixed,
        [styles.headerScrolledTop]: !getIsScrollingBottom() && getIsScrolled(),
        [styles.headerScrolledBottom]:
          (getIsScrollingBottom() && getIsScrolled() && !isProfilePopupVisible()) || isSharePopupVisible(),
        [styles.headerWithTitle]: Boolean(props.title)
      }}
    >
      <Modal variant={searchParams().source ? 'narrow' : 'wide'} name="auth" noPadding={true}>
        <AuthModal />
      </Modal>

      <Modal variant="narrow" name="confirm">
        <ConfirmModal />
      </Modal>

      <div class={clsx(styles.mainHeaderInner, 'wide-container')}>
        <nav class={clsx('row', styles.headerInner, { ['fixed']: fixed() })}>
          <div class={clsx('col-md-5 col-xl-4 col-auto', styles.mainLogo)}>
            <a href={getPagePath(router, 'home')}>
              <img src="/logo.svg" alt={t('Discours')} />
            </a>
          </div>
          <div class={clsx('col offset-xl-1', styles.mainNavigationWrapper)}>
            <Show when={props.title}>
              <div class={styles.articleHeader}>{props.title}</div>
            </Show>
            <ul class={clsx('view-switcher', styles.mainNavigation)} classList={{ fixed: fixed() }}>
              <li classList={{ 'view-switcher__item--selected': page().route === 'home' }}>
                <a
                  onmouseover={() => toggleSubnavigation(true, setIsZineVisible)}
                  href={getPagePath(router, 'home')}
                >
                  {t('zine')}
                </a>
              </li>
              <li classList={{ 'view-switcher__item--selected': page().route.startsWith('feed') }}>
                <a
                  onmouseover={() => toggleSubnavigation(true, setIsFeedVisible)}
                  href={getPagePath(router, 'feed')}
                >
                  {t('feed')}
                </a>
              </li>
              <li classList={{ 'view-switcher__item--selected': page().route === 'topics' }}>
                <a
                  onmouseover={() => toggleSubnavigation(true, setIsTopicsVisible)}
                  href={getPagePath(router, 'topics')}
                >
                  {t('topics')}
                </a>
              </li>
              <li classList={{ 'view-switcher__item--selected': page().route === 'authors' }}>
                <a href={getPagePath(router, 'authors')}>{t('community')}</a>
              </li>
              <li>
                <a onmouseover={() => toggleSubnavigation(true, setIsKnowledgeBaseVisible)}>
                  {t('Knowledge base')}
                </a>
              </li>
            </ul>
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
          <div class={clsx(styles.burgerContainer, 'col-auto')}>
            <div class={styles.burger} classList={{ fixed: fixed() }} onClick={toggleFixed}>
              <div />
            </div>
          </div>

          <div class={clsx(styles.subnavigation, 'col')} classList={{ hidden: !isKnowledgeBaseVisible() }}>
            <ul class="nodash">
              <li>
                <a href="/about/manifest">Манифест</a>
              </li>
              <li>
                <a href="/about/dogma">Догма</a>
              </li>
              <li>
                <a href="/about/principles">Принципы сообщества</a>
              </li>
              <li>
                <a href="/about/guide">Гид по дискурсу</a>
              </li>
              <li>
                <a href="">Частые вопросы</a>
              </li>
              <li>
                <a href="">Энциклопедия</a>
              </li>
              <li>
                <a href="">Как поддержать?</a>
              </li>
              <li>
                <a href="/about/help">Как помочь?</a>
              </li>
              <li class={styles.rightItem}>
                <a href="/connect">
                  {t('Suggest an idea')}
                  <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                </a>
              </li>
            </ul>
          </div>

          <div class={clsx(styles.subnavigation, 'col')} classList={{ hidden: !isZineVisible() }}>
            <ul class="nodash">
              <li>
                <a href="">Искусство</a>
              </li>
              <li>
                <a href="">Подкасты</a>
              </li>
              <li>
                <a href="">Спецпроекты</a>
              </li>
              <li>
                <a href="">#Интервью</a>
              </li>
              <li>
                <a href="">#Репортажи</a>
              </li>
              <li>
                <a href="">#Личный опыт</a>
              </li>
              <li>
                <a href="">#Общество</a>
              </li>
              <li>
                <a href="">#Культура</a>
              </li>
              <li>
                <a href="">#Теории</a>
              </li>
              <li>
                <a href="">#Поэзия</a>
              </li>
              <li class={styles.rightItem}>
                <a href="/topics">
                  {t('All topics')}
                  <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                </a>
              </li>
            </ul>
          </div>

          <div class={clsx(styles.subnavigation, 'col')} classList={{ hidden: !isTopicsVisible() }}>
            <ul class="nodash">
              <li>
                <a href="">#Интервью</a>
              </li>
              <li>
                <a href="">#Репортажи</a>
              </li>
              <li>
                <a href="">#Личный опыт</a>
              </li>
              <li>
                <a href="">#Общество</a>
              </li>
              <li>
                <a href="">#Культура</a>
              </li>
              <li>
                <a href="">#Теории</a>
              </li>
              <li>
                <a href="">#Поэзия</a>
              </li>
              <li>
                <a href="">#Теории</a>
              </li>
            </ul>
          </div>

          <div
            class={clsx(styles.subnavigation, styles.subnavigationFeed, 'col')}
            classList={{ hidden: !isFeedVisible() }}
          >
            <ul class="nodash">
              <li>
                <a
                  href={getPagePath(router, 'feed')}
                  class={clsx({
                    [styles.selected]: page().route === 'feed'
                  })}
                >
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-all" class={styles.icon} />
                    {t('general feed')}
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={getPagePath(router, 'feedMy')}
                  class={clsx({
                    [styles.selected]: page().route === 'feedMy'
                  })}
                >
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-my" class={styles.icon} />
                    {t('My feed')}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={getPagePath(router, 'feedCollaborations')}
                  class={clsx({
                    [styles.selected]: page().route === 'feedCollaborations'
                  })}
                >
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-collaborate" class={styles.icon} />
                    {t('Accomplices')}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={getPagePath(router, 'feedDiscussions')}
                  class={clsx({
                    [styles.selected]: page().route === 'feedDiscussions'
                  })}
                >
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-discussion" class={styles.icon} />
                    {t('Discussions')}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={getPagePath(router, 'feedBookmarks')}
                  class={clsx({
                    [styles.selected]: page().route === 'feedBookmarks'
                  })}
                >
                  <span class={styles.subnavigationItemName}>
                    <Icon name="bookmark" class={styles.icon} />
                    {t('Bookmarks')}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={getPagePath(router, 'feedNotifications')}
                  class={clsx({
                    [styles.selected]: page().route === 'feedNotifications'
                  })}
                >
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
