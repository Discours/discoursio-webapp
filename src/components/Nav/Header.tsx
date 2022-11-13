import { For, Show, createSignal, createMemo, createEffect, onMount, onCleanup } from 'solid-js'
import Notifications from './Notifications'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { AuthModal } from './AuthModal'
import { t } from '../../utils/intl'
import { useModalStore, showModal, useWarningsStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { handleClientRouteLinkClick, router, Routes, useRouter } from '../../stores/router'
import styles from './Header.module.scss'
import { getPagePath } from '@nanostores/router'
import { getLogger } from '../../utils/logger'
import { clsx } from 'clsx'
import { SharePopup } from '../Article/SharePopup'
import { ProfilePopup } from './ProfilePopup'
import Userpic from '../Author/Userpic'
import type { Author } from '../../graphql/types.gen'

const log = getLogger('header')

const resources: { name: string; route: keyof Routes }[] = [
  { name: t('zine'), route: 'home' },
  { name: t('feed'), route: 'feed' },
  { name: t('topics'), route: 'topics' }
]

type Props = {
  title?: string
  isHeaderFixed?: boolean
}

export const Header = (props: Props) => {
  // signals
  const [getIsScrollingBottom, setIsScrollingBottom] = createSignal(false)
  const [getIsScrolled, setIsScrolled] = createSignal(false)
  const [fixed, setFixed] = createSignal(false)
  const [visibleWarnings, setVisibleWarnings] = createSignal(false)
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)
  const [isProfilePopupVisible, setIsProfilePopupVisible] = createSignal(false)

  // stores
  const { warnings } = useWarningsStore()
  const { session } = useAuthStore()
  const { modal } = useModalStore()

  const { page } = useRouter()

  // methods
  const toggleWarnings = () => setVisibleWarnings(!visibleWarnings())
  const toggleFixed = () => setFixed((oldFixed) => !oldFixed)
  // effects

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

  // derived
  const authorized = createMemo(() => session()?.user?.slug)

  const handleBellIconClick = (event: Event) => {
    event.preventDefault()

    if (!authorized()) {
      showModal('auth')
      return
    }

    toggleWarnings()
  }

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
      <Modal name="auth">
        <AuthModal />
      </Modal>

      <div class={clsx(styles.mainHeaderInner, 'wide-container')}>
        <nav class={clsx(styles.headerInner, 'row')} classList={{ fixed: fixed() }}>
          <div class={clsx(styles.mainLogo, 'col-auto')}>
            <a href={getPagePath(router, 'home')} onClick={handleClientRouteLinkClick}>
              <img src="/logo.svg" alt={t('Discours')} />
            </a>
          </div>
          <div class={clsx(styles.mainNavigationWrapper, 'col')}>
            <Show when={props.title}>
              <div class={styles.articleHeader}>{props.title}</div>
            </Show>

            <ul
              class={clsx(styles.mainNavigation, 'col text-xl inline-flex')}
              classList={{ fixed: fixed() }}
            >
              <For each={resources}>
                {(r) => (
                  <li classList={{ [styles.selected]: r.route === page().route }}>
                    <a href={getPagePath(router, r.route, null)} onClick={handleClientRouteLinkClick}>
                      {r.name}
                    </a>
                  </li>
                )}
              </For>
              <li class={styles.headerSearch}>
                <a href="#">
                  <Icon name="search" class={styles.icon} iconClassName={styles.searchIcon} />
                  {t('Search')}
                </a>
              </li>
            </ul>
          </div>
          <div class={styles.usernav}>
            <div class={clsx(styles.userControl, styles.userControl, 'col')}>
              <div class={clsx(styles.userControlItem, styles.userControlItemVerbose)}>
                <a href="/create" onClick={handleClientRouteLinkClick}>
                  <span class={styles.textLabel}>{t('Create post')}</span>
                  <Icon name="pencil" class={styles.icon} />
                </a>
              </div>

              <Show when={authorized()}>
                <div class={styles.userControlItem}>
                  <a href="#" onClick={handleBellIconClick}>
                    <div>
                      <Icon name="bell-white" counter={authorized() ? warnings().length : 1} />
                    </div>
                  </a>
                </div>
              </Show>

              <Show when={visibleWarnings()}>
                <div class={clsx(styles.userControlItem, 'notifications')}>
                  <Notifications />
                </div>
              </Show>

              <Show
                when={authorized()}
                fallback={
                  <div class={clsx(styles.userControlItem, styles.userControlItemVerbose, 'loginbtn')}>
                    <a href="?modal=auth&mode=login" onClick={handleClientRouteLinkClick}>
                      <span class={styles.textLabel}>{t('Enter')}</span>
                      <Icon name="user-anonymous" class={styles.icon} />
                    </a>
                  </div>
                }
              >
                <div class={clsx(styles.userControlItem, styles.userControlItemInbox)}>
                  <a href="/inbox">
                    {/*FIXME: replace with route*/}
                    <div classList={{ entered: page().path === '/inbox' }}>
                      <Icon name="inbox-white" counter={session()?.news?.unread || 0} />
                    </div>
                  </a>
                </div>
                <ProfilePopup
                  onVisibilityChange={(isVisible) => {
                    setIsProfilePopupVisible(isVisible)
                  }}
                  containerCssClass={styles.control}
                  trigger={
                    <div class={styles.userControlItem}>
                      <button class={styles.button}>
                        <div classList={{ entered: page().path === `/${session().user?.slug}` }}>
                          <Userpic user={session().user as Author} class={styles.userpic} />
                        </div>
                      </button>
                    </div>
                  }
                />
              </Show>
            </div>
            <Show when={props.title}>
              <div class={styles.articleControls}>
                <SharePopup
                  onVisibilityChange={(isVisible) => {
                    setIsSharePopupVisible(isVisible)
                  }}
                  containerCssClass={styles.control}
                  trigger={<Icon name="share-outline" class={styles.icon} />}
                />
                <a href="#comments" class={styles.control}>
                  <Icon name="comments-outline" class={styles.icon} />
                </a>
                <a href="#" class={styles.control} onClick={(event) => event.preventDefault()}>
                  <Icon name="pencil-outline" class={styles.icon} />
                </a>
                <a href="#" class={styles.control} onClick={(event) => event.preventDefault()}>
                  <Icon name="bookmark" class={styles.icon} />
                </a>
              </div>
            </Show>
          </div>
          <div class={styles.burgerContainer}>
            <div class={styles.burger} classList={{ fixed: fixed() }} onClick={toggleFixed}>
              <div />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
