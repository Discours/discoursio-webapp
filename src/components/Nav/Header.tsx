import { For, Show, createSignal, createMemo, createEffect, onMount, onCleanup } from 'solid-js'
import Private from './Private'
import Notifications from './Notifications'
import { Icon } from './Icon'
import { Modal } from './Modal'
import AuthModal from './AuthModal'
import { t } from '../../utils/intl'
import { useModalStore, showModal, useWarningsStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { handleClientRouteLinkClick, router, Routes, useRouter } from '../../stores/router'
import styles from './Header.module.scss'
import privateStyles from './Private.module.scss'
import { getPagePath } from '@nanostores/router'
import { getLogger } from '../../utils/logger'
import { clsx } from 'clsx'
import { SharePopup } from '../Article/SharePopup'

const log = getLogger('header')

const resources: { name: string; route: keyof Routes }[] = [
  { name: t('zine'), route: 'home' },
  { name: t('feed'), route: 'feed' },
  { name: t('topics'), route: 'topics' }
]

const handleEnterClick = () => {
  showModal('auth')
}

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
  // stores
  const { getWarnings } = useWarningsStore()
  const { session } = useAuthStore()
  const { getModal } = useModalStore()

  const { getPage } = useRouter()

  // methods
  const toggleWarnings = () => setVisibleWarnings(!visibleWarnings())
  const toggleFixed = () => setFixed((oldFixed) => !oldFixed)
  // effects
  createEffect(() => {
    document.body.classList.toggle('fixed', fixed() || getModal() !== null)
  })

  // derived
  const authorized = createMemo(() => session()?.user?.slug)

  const handleBellIconClick = () => {
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
        [styles.headerScrolledBottom]: (getIsScrollingBottom() && getIsScrolled()) || isSharePopupVisible(),
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
                  <li classList={{ [styles.selected]: r.route === getPage().route }}>
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
                <a href="#auth" onClick={handleBellIconClick}>
                  <div>
                    <Icon name="bell-white" counter={authorized() ? getWarnings().length : 1} />
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
                    <a href="#auth" onClick={handleEnterClick}>
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
                <SharePopup
                  onVisibilityChange={(isVisible) => {
                    console.log({ isVisible })
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
