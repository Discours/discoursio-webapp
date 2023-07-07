import { For, Show, createSignal, createEffect, onMount, onCleanup } from 'solid-js'
import { Icon } from '../_shared/Icon'
import { Modal } from './Modal'
import { AuthModal } from './AuthModal'
import { useModalStore } from '../../stores/ui'
import { router, ROUTES, useRouter } from '../../stores/router'
import styles from './Header.module.scss'
import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'
import { HeaderAuth } from './HeaderAuth'
import { getShareUrl, SharePopup } from '../Article/SharePopup'
import { getDescription } from '../../utils/meta'
import { Snackbar } from './Snackbar'
import { useLocalize } from '../../context/localize'

type Props = {
  title?: string
  slug?: string
  isHeaderFixed?: boolean
  articleBody?: string
  cover?: string
  scrollToComments?: (value: boolean) => void
}

export const Header = (props: Props) => {
  const { t } = useLocalize()

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

  const scrollToComments = (event, value) => {
    event.preventDefault()
    props.scrollToComments(value)
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
      <Modal variant="wide" name="auth" noPadding={true}>
        <AuthModal />
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
                <a href={getPagePath(router, 'home')}>{t('zine')}</a>
              </li>
              <li classList={{ 'view-switcher__item--selected': page().route.startsWith('feed') }}>
                <a href={getPagePath(router, 'feed')}>{t('feed')}</a>
              </li>
              <li classList={{ 'view-switcher__item--selected': page().route === 'topics' }}>
                <a href={getPagePath(router, 'topics')}>{t('topics')}</a>
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
                trigger={<Icon name="share-outline" class={styles.icon} />}
              />
              <div onClick={(event) => scrollToComments(event, true)} class={styles.control}>
                <Icon name="comments-outline" class={styles.icon} />
              </div>
              <a href={getPagePath(router, 'create')} class={styles.control}>
                <Icon name="pencil-outline" class={styles.icon} />
              </a>
              <a href="#" class={styles.control} onClick={(event) => event.preventDefault()}>
                <Icon name="bookmark" class={styles.icon} />
              </a>
            </div>
          </Show>
          <div class={clsx(styles.burgerContainer, 'col-auto')}>
            <div class={styles.burger} classList={{ fixed: fixed() }} onClick={toggleFixed}>
              <div />
            </div>
          </div>
        </nav>
        <Snackbar />
      </div>
    </header>
  )
}
