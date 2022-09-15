import { For, Show, createSignal, createMemo, createEffect, onMount, onCleanup } from 'solid-js'
import Private from './Private'
import Notifications from './Notifications'
import Icon from './Icon'
import { Modal } from './Modal'
import AuthModal from './AuthModal'
import { t } from '../../utils/intl'
import { useModalStore, showModal, useWarningsStore } from '../../stores/ui'
import { useStore } from '@nanostores/solid'
import { session as ssession } from '../../stores/auth'
import { route, router } from '../../stores/router'
import './Header.scss'

const resources = [
  { name: t('zine'), href: '/' },
  { name: t('feed'), href: '/feed' },
  { name: t('topics'), href: '/topics' }
  //{ name: t('community'), href: '/community' }
]

export const Header = () => {
  // signals
  const [getIsScrollingBottom, setIsScrollingBottom] = createSignal(false)
  const [fixed, setFixed] = createSignal(false)
  const [visibleWarnings, setVisibleWarnings] = createSignal(false)
  // stores
  const { getWarnings } = useWarningsStore()
  const session = useStore(ssession)
  const { getModal } = useModalStore()
  const routing = useStore(router)
  const subpath = createMemo(() => routing().path)
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
  const enterClick = route(() => showModal('auth'))
  const bellClick = createMemo(() => (authorized() ? route(toggleWarnings) : enterClick))

  const root = null

  onMount(() => {
    let scrollTop = window.scrollY

    const handleScroll = () => {
      setIsScrollingBottom(window.scrollY > scrollTop)
      scrollTop = window.scrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    onCleanup(() => {
      window.removeEventListener('scroll', handleScroll)
    })
  })

  return (
    <header
      classList={{
        ['header--scrolled-top']: !getIsScrollingBottom(),
        ['header--scrolled-bottom']: getIsScrollingBottom()
      }}
    >
      <Modal name="auth">
        <AuthModal />
      </Modal>
      <div class="wide-container">
        <nav class="row header__inner" classList={{ fixed: fixed() }}>
          <div class="main-logo col-auto">
            <a href="/" onClick={route}>
              <img src="/logo.svg" alt={t('Discours')} />
            </a>
          </div>
          <ul class="col main-navigation text-xl inline-flex" classList={{ fixed: fixed() }}>
            <For each={resources}>
              {(r: { href: string; name: string }) => (
                <li classList={{ selected: r.href === subpath() }}>
                  <a href={r.href} onClick={route}>
                    {r.name}
                  </a>
                </li>
              )}
            </For>
          </ul>
          <div class="usernav">
            <div class="usercontrol col">
              <div class="usercontrol__item">
                <a href="#auth" onClick={bellClick}>
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
                    <a href="#auth" onClick={enterClick}>
                      {t('enter')}
                    </a>
                  </div>
                }
              >
                <Private />
              </Show>
            </div>
          </div>
          <div class="burger-container">
            <div class="burger" classList={{ fixed: fixed() }} onClick={toggleFixed}>
              <div />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
