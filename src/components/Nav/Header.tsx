import { For, Show, createSignal, createMemo, createEffect, onMount, onCleanup } from 'solid-js'
import Private from './Private'
import Notifications from './Notifications'
import { Icon } from './Icon'
import { Modal } from './Modal'
import { Popup } from './Popup'
import { AuthModal } from './AuthModal'
import { t } from '../../utils/intl'
import { useModalStore, showModal, useWarningsStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { handleClientRouteLinkClick, router, Routes, useRouter } from '../../stores/router'
import styles from './Header.module.scss'
import stylesPopup from './Popup.module.scss'
import privateStyles from './Private.module.scss'
import { getPagePath } from '@nanostores/router'
import { getLogger } from '../../utils/logger'
import { clsx } from 'clsx'

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
  // stores
  const { warnings } = useWarningsStore()
  const { session } = useAuthStore()
  const { modal } = useModalStore()

  const { page } = useRouter()

  // methods
  const toggleWarnings = () => setVisibleWarnings(!visibleWarnings())
  const toggleFixed = () => setFixed(!fixed())
  // effects
  createEffect(() => {
    const isFixed = fixed() || (modal() && modal() !== 'share');

    document.body.classList.toggle('fixed', isFixed);
    document.body.classList.toggle(styles.fixed, isFixed && !modal());
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
        [styles.headerScrolledBottom]: getIsScrollingBottom() && getIsScrolled(),
        [styles.headerWithTitle]: Boolean(props.title)
      }}
    >
      <Modal name="auth">
        <AuthModal />
      </Modal>

      <div class={clsx(styles.mainHeaderInner, 'wide-container')}>
        <Popup name="share" class={clsx(styles.popupShare, stylesPopup.popupShare)}>
          <ul class="nodash">
            <li>
              <a href="#">
                <Icon name="vk-white" class={stylesPopup.icon} />
                VK
              </a>
            </li>
            <li>
              <a href="#">
                <Icon name="facebook-white" class={stylesPopup.icon} />
                Facebook
              </a>
            </li>
            <li>
              <a href="#">
                <Icon name="twitter-white" class={stylesPopup.icon} />
                Twitter
              </a>
            </li>
            <li>
              <a href="#">
                <Icon name="telegram-white" class={stylesPopup.icon} />
                Telegram
              </a>
            </li>
            <li>
              <a href="#">
                <Icon name="link-white" class={stylesPopup.icon} />
                {t('Copy link')}
              </a>
            </li>
          </ul>
        </Popup>

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
            <div class={clsx(privateStyles.userControl, styles.userControl, 'col')}>
              <div class={privateStyles.userControlItem}>
                <a href="#" onClick={handleBellIconClick}>
                  <div>
                    <Icon name="bell-white" counter={authorized() ? warnings().length : 1} />
                  </div>
                </a>
              </div>

              <Show when={visibleWarnings()}>
                <div class={clsx(privateStyles.userControlItem, 'notifications')}>
                  <Notifications />
                </div>
              </Show>

              <Show
                when={authorized()}
                fallback={
                  <div class={clsx(privateStyles.userControlItem, 'loginbtn')}>
                    <a href="?modal=auth&mode=login" onClick={handleClientRouteLinkClick}>
                      <Icon name="user-anonymous" />
                    </a>
                  </div>
                }
              >
                <Private />
              </Show>
            </div>
            <Show when={props.title}>
              <div class={styles.articleControls}>
                <button
                  onClick={() => {
                    // FIXME: Popup
                    showModal('share')
                  }}
                >
                  <Icon name="share-outline" class={styles.icon} />
                </button>
                <a href="#comments">
                  <Icon name="comments-outline" class={styles.icon} />
                </a>
                <Icon name="pencil-outline" class={styles.icon} />
                <Icon name="bookmark" class={styles.icon} />
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
