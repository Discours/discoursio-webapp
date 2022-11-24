import { For, Show, createSignal, createEffect, onMount, onCleanup } from 'solid-js'
import { Icon } from '../_shared/Icon'
import { Modal } from './Modal'
import { AuthModal } from './AuthModal'
import { t } from '../../utils/intl'
import { useModalStore } from '../../stores/ui'
import { router, Routes, useRouter } from '../../stores/router'
import styles from './Header.module.scss'
import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'
import { HeaderAuth } from './HeaderAuth'
import { SharePopup } from '../Article/SharePopup'

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
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)
  const [isProfilePopupVisible, setIsProfilePopupVisible] = createSignal(false)

  const { modal } = useModalStore()

  const { page } = useRouter()

  // methods

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
            <a href={getPagePath(router, 'home')}>
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
                    <a href={getPagePath(router, r.route, null)}>{r.name}</a>
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
          <HeaderAuth setIsProfilePopupVisible={setIsProfilePopupVisible} />
          <Show when={props.title}>
            <div class={styles.articleControls}>
              <SharePopup
                onVisibilityChange={(isVisible) => {
                  setIsSharePopupVisible(isVisible)
                }}
                containerCssClass={styles.control}
                trigger={<Icon name="share-outline" class={styles.icon} />}
              />
              <a href={getPagePath(router, 'inbox')} class={styles.control}>
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
