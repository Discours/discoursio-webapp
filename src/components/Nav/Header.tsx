import { For, Show, createSignal, createMemo, createEffect, onMount, onCleanup } from 'solid-js'
import Private from './Private'
import Notifications from './Notifications'
import { Icon } from './Icon'
import { Modal } from './Modal'
import AuthModal from './AuthModal'
import { t } from '../../utils/intl'
import { useModalStore, showModal, useWarningsStore } from '../../stores/ui'
import { useStore } from '@nanostores/solid'
import { session as ssession } from '../../stores/auth'
import { handleClientRouteLinkClick, router, Routes, useRouter } from '../../stores/router'
import styles from './Header.module.scss'
import { getPagePath } from '@nanostores/router'
import { getLogger } from '../../utils/logger'
import { clsx } from 'clsx'

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
  // stores
  const { getWarnings } = useWarningsStore()
  const session = useStore(ssession)
  const { getModal } = useModalStore()

  const { getPage } = useRouter()

  // methods
  const toggleWarnings = () => setVisibleWarnings(!visibleWarnings())
  const toggleFixed = () => setFixed(!fixed())
  // effects
  createEffect(() => {
    if (fixed() || getModal()) {
      document.body.classList.add('fixed')
    } else {
      document.body.classList.remove('fixed')
    }
  }, [fixed(), getModal()])

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
        [styles.headerScrolledBottom]: getIsScrollingBottom() && getIsScrolled()
      }}
    >
      <Modal name="auth">
        <AuthModal />
      </Modal>
      <div class="wide-container">
        <nav class={clsx(styles.headerInner, 'row')} classList={{ fixed: fixed() }}>
          <div class={clsx(styles.mainLogo, 'col-auto')}>
            <a href={getPagePath(router, 'home')} onClick={handleClientRouteLinkClick}>
              <img src="/logo.svg" alt={t('Discours')} />
            </a>
          </div>
          <div class={clsx(styles.mainNavigation, 'col')}>
            <div class={styles.articleHeader}>{props.title}</div>

            <ul
              class={clsx(styles.mainNavigation, 'col text-xl inline-flex')}
              classList={{ fixed: fixed() }}
            >
              <For each={resources}>
                {(r) => (
                  <li classList={{ selected: r.route === getPage().route }}>
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
            <div class="usercontrol col">
              <div class="usercontrol__item">
                <a href="#auth" onClick={handleBellIconClick}>
                  <div>
                    <Icon name="bell-white" counter={authorized() ? getWarnings().length : 1} />
                  </div>
                </a>
              </div>

              <Show when={visibleWarnings()}>
                <div class="usercontrol__item notifications">
                  <Notifications />
                </div>
              </Show>

              <Show
                when={authorized()}
                fallback={
                  <div class="usercontrol__item loginbtn">
                    <a href="#auth" onClick={handleEnterClick}>
                      {t('enter')}
                    </a>
                  </div>
                }
              >
                <Private />
              </Show>
            </div>
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
