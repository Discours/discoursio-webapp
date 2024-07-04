import { A, useLocation, useNavigate, useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { Icon } from '~/components/_shared/Icon'
import { Newsletter } from '~/components/_shared/Newsletter'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useTopics } from '~/context/topics'
import { useUI } from '~/context/ui'
import type { Topic } from '~/graphql/schema/core.gen'
import { getRandomTopicsFromArray } from '~/utils/getRandomTopicsFromArray'
import { getDescription } from '~/utils/meta'
import { SharePopup, getShareUrl } from '../../Article/SharePopup'
import { AuthModal } from '../AuthModal'
import { ConfirmModal } from '../ConfirmModal'
import { HeaderAuth } from '../HeaderAuth'
import { Modal } from '../Modal'
import { SearchModal } from '../SearchModal/SearchModal'
import { Snackbar } from '../Snackbar'
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

const handleSwitchLanguage = (value: string) => {
  location.href = `${location.href}${location.href.includes('?') ? '&' : '?'}lng=${value}`
}

export const Header = (props: Props) => {
  const { t, lang } = useLocalize()
  const { modal } = useUI()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams<HeaderSearchParams>()
  const { requireAuthentication } = useSession()
  const { sortedTopics } = useTopics()
  const topics = createMemo<Topic[]>(() => sortedTopics())
  const [randomTopics, setRandomTopics] = createSignal<Topic[]>([])
  const [getIsScrollingBottom, setIsScrollingBottom] = createSignal(false)
  const [getIsScrolled, setIsScrolled] = createSignal(false)
  const [fixed, setFixed] = createSignal(false)
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)
  const [isProfilePopupVisible, setIsProfilePopupVisible] = createSignal(false)
  const [isTopMenuVisible, setIsTopMenuVisible] = createSignal(false)
  const { session } = useSession()

  const toggleFixed = () => setFixed(!fixed())

  const tag = (topic: Topic) =>
    /[ЁА-яё]/.test(topic.title || '') && lang() !== 'ru' ? topic.slug : topic.title

  let windowScrollTop = 0

  createEffect(() => {
    if (topics()?.length) {
      const rt: Topic[] = getRandomTopicsFromArray(topics())
      setRandomTopics(rt)
    }
  })

  createEffect(() => {
    const mainContent = document.querySelector<HTMLDivElement>('.main-content')

    if ((window && fixed()) || modal() !== null) {
      windowScrollTop = window.scrollY
      if (mainContent) {
        mainContent.style.marginTop = `-${windowScrollTop}px`
      }
    }

    document.body.classList.toggle('fixed', fixed() || modal() !== null)
    document.body.classList.toggle(styles.fixed, fixed() && !modal())

    if (!(fixed() || modal())) {
      if (mainContent) {
        mainContent.style.marginTop = ''
      }
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

  const scrollToComments = (event: MouseEvent | undefined, value: boolean) => {
    event?.preventDefault()
    props.scrollToComments?.(value)
  }

  const handleBookmarkButtonClick = (ev: MouseEvent | undefined) => {
    requireAuthentication(() => {
      // TODO: implement bookmark clicked
      ev?.preventDefault()
    }, 'bookmark')
  }

  const handleCreateButtonClick = (ev: MouseEvent | undefined) => {
    requireAuthentication(() => {
      ev?.preventDefault()

      navigate('/edit/new')
    }, 'create')
  }

  const toggleSubnavigation = (isShow: boolean, signal?: (v: boolean) => void) => {
    clearTimer()
    setIsTopMenuVisible(false)

    if (signal) {
      signal(isShow)
    }
  }

  let timer: string | number | NodeJS.Timeout

  const clearTimer = () => {
    clearTimeout(timer)
  }

  const hideSubnavigation = (time = 500) => {
    timer = setTimeout(() => {
      toggleSubnavigation(false)
    }, time)
  }
  const loc = useLocation()
  const handleToggleMenuByLink = (event: MouseEvent, route: string) => {
    event.preventDefault()
    navigate(route)
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
      <Modal
        variant={searchParams?.source ? 'narrow' : 'wide'}
        name="auth"
        hideClose={Boolean(searchParams?.source === 'authguard')}
        noPadding={true}
      >
        <AuthModal />
      </Modal>

      <Modal variant="narrow" name="confirm">
        <ConfirmModal />
      </Modal>

      <Modal variant="wide" name="search">
        <SearchModal />
      </Modal>

      <div class={clsx(styles.mainHeaderInner, 'wide-container')}>
        <nav class={clsx('row', styles.headerInner, { [styles.fixed]: fixed() })}>
          <div class={clsx(styles.burgerContainer, 'col-auto')}>
            <div class={clsx(styles.burger, { [styles.fixed]: fixed() })} onClick={toggleFixed}>
              <div />
            </div>
          </div>
          <div class={clsx('col-md-5 col-xl-4 col-auto', styles.mainLogo)}>
            <A href={'/'}>
              <img src="/logo.svg" alt={t('Discours')} />
            </A>
          </div>
          <div class={clsx('col col-md-13 col-lg-12 offset-xl-1', styles.mainNavigationWrapper)}>
            <Show when={props.title}>
              <div class={styles.articleHeader}>{props.title}</div>
            </Show>
            <div class={clsx(styles.mainNavigation, { [styles.fixed]: fixed() })}>
              <ul class="view-switcher">
                <For each={['', 'feed', 'topics', 'authors', 'guide']}>
                  {(route: string) => (
                    <li classList={{ 'view-switcher__item--selected': loc.pathname.includes(route) }}>
                      <A
                        class={clsx({ [styles.mainNavigationItemActive]: loc.pathname.includes(route) })}
                        href={`/${route}`}
                        onClick={(event) => handleToggleMenuByLink(event, `/${route}`)}
                        onMouseOver={() => toggleSubnavigation(true, setIsTopMenuVisible)}
                        onMouseOut={() => hideSubnavigation()}
                      >
                        {t(route || 'journal')}
                      </A>
                    </li>
                  )}
                </For>
              </ul>

              <div class={styles.mainNavigationMobile}>
                <h4>{t('Participating')}</h4>
                <ul class="view-switcher">
                  <li>
                    <A href="/edit/new">{t('Create post')}</A>
                  </li>
                  <li>
                    <A href="/connect">{t('Suggest an idea')}</A>
                  </li>
                  <li>
                    <A href="/guide/support">{t('Support the project')}</A>
                  </li>
                </ul>

                <h4>{t('Subscribe us')}</h4>
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
                <Newsletter variant={'mobileSubscription'} />

                <h4>{t('Language')}</h4>
                <select
                  class={styles.languageSelectorMobile}
                  onChange={(ev) => handleSwitchLanguage(ev.target.value)}
                  value={lang()}
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>

                <div class={styles.mainNavigationAdditionalLinks}>
                  <A href="/guide/dogma">{t('Dogma')}</A>
                  <A href="/guide/debate">{t('Discussion rules')}</A>
                  <A href="/guide/principles">{t('Our principles')}</A>
                </div>

                <p
                  class={styles.mobileDescription}
                  innerHTML={t(
                    'Independant magazine with an open horizontal cooperation about culture, science and society'
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
            <div
              class={clsx(styles.articleControls, 'col-auto', {
                [styles.articleControlsAuthorized]: session()?.user?.id
              })}
            >
              <SharePopup
                title={props.title || ''}
                imageUrl={props.cover || ''}
                shareUrl={getShareUrl()}
                description={getDescription(props.articleBody || '')}
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
              <button class={styles.control} onClick={handleCreateButtonClick}>
                <Icon name="pencil-outline" class={styles.icon} />
                <Icon name="pencil-outline-hover" class={clsx(styles.icon, styles.iconHover)} />
              </button>
              <button class={styles.control} onClick={handleBookmarkButtonClick}>
                <Icon name="bookmark" class={styles.icon} />
                <Icon name="bookmark-hover" class={clsx(styles.icon, styles.iconHover)} />
              </button>
            </div>
          </Show>

          <div
            class={clsx(styles.subnavigation, 'col')}
            onMouseOver={clearTimer}
            onMouseOut={() => hideSubnavigation()}
          >
            <ul class="nodash">
              <li>
                <A href="/guide/manifest">{t('Manifesto')}</A>
              </li>
              <li>
                <A href="/guide/dogma">{t('Dogma')}</A>
              </li>
              <li>
                <A href="/guide/principles">{t('Community Our principles')}</A>
              </li>
              <li>
                <A href="/guide">{t('Platform Guide')}</A>
              </li>
              <li>
                <A href="/guide/manifest#participation">{t('Support us')}</A>
              </li>
              <li>
                <A href="/guide/support">{t('How to help')}</A>
              </li>
              <li class={styles.rightItem}>
                <A href="/connect">
                  {t('Suggest an idea')}
                  <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                </A>
              </li>
            </ul>
          </div>

          <div
            class={clsx(styles.subnavigation, 'col')}
            classList={{ hidden: !isTopMenuVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={() => hideSubnavigation()}
          >
            <ul class="nodash">
              <li class="item">
                <A href="/expo">{t('Art')}</A>
              </li>
              <li class="item">
                <A href="/podcasts">{t('Podcasts')}</A>
              </li>
              <li class="item">
                <A href="/guide/projects">{t('Special Projects')}</A>
              </li>
              <li>
                <A href="/topic/interview">#{t('Interview')}</A>
              </li>
              <li>
                <A href="/topic/reportage">#{t('Reports')}</A>
              </li>
              <li>
                <A href="/topic/empiric">#{t('Experience')}</A>
              </li>
              <li>
                <A href="/topic/society">#{t('Society')}</A>
              </li>
              <li>
                <A href="/topic/culture">#{t('Culture')}</A>
              </li>
              <li>
                <A href="/topic/theory">#{t('Theory')}</A>
              </li>
              <li>
                <A href="/topic/poetry">#{t('Poetry')}</A>
              </li>
              <li class={styles.rightItem}>
                <A href="/topic">
                  {t('All topics')}
                  <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                </A>
              </li>
            </ul>
          </div>

          <div
            class={clsx(styles.subnavigation, 'col')}
            onMouseOver={clearTimer}
            onMouseOut={() => hideSubnavigation()}
          >
            <ul class="nodash">
              <Show when={randomTopics().length > 0}>
                <For each={randomTopics()}>
                  {(topic: Topic) => (
                    <li class="item">
                      <A href={`/topic/${topic.slug}`}>
                        <span>#{tag(topic)}</span>
                      </A>
                    </li>
                  )}
                </For>
                <li class={styles.rightItem}>
                  <A href="/topic">
                    {t('All topics')}
                    <Icon name="arrow-right-black" class={clsx(styles.icon, styles.rightItemIcon)} />
                  </A>
                </li>
              </Show>
            </ul>
          </div>

          <div
            class={clsx(styles.subnavigation, styles.subnavigationFeed, 'col')}
            onMouseOver={clearTimer}
            onMouseOut={() => hideSubnavigation()}
          >
            <ul class="nodash">
              <li>
                <A href={'/feed'}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-all" class={styles.icon} />
                    {t('All')}
                  </span>
                </A>
              </li>

              <li>
                <A href={'/feed/followed'}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-my" class={styles.icon} />
                    {t('My feed')}
                  </span>
                </A>
              </li>
              <li>
                <A href={'/feed/coauthored'}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-collaborate" class={styles.icon} />
                    {t('Participation')}
                  </span>
                </A>
              </li>
              <li>
                <A href={'/feed/discussed'}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="feed-discussion" class={styles.icon} />
                    {t('Discussions')}
                  </span>
                </A>
              </li>
              <li>
                <A href={'/feed/bookmarked'}>
                  <span class={styles.subnavigationItemName}>
                    <Icon name="bookmark" class={styles.icon} />
                    {t('Bookmarks')}
                  </span>
                </A>
              </li>
            </ul>
          </div>
        </nav>

        <Snackbar />
      </div>
    </header>
  )
}
