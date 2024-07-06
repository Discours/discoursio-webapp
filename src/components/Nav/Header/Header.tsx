import { A, redirect, useSearchParams } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { useTopics } from '~/context/topics'
import { useUI } from '~/context/ui'
import type { Topic } from '../../../graphql/schema/core.gen'
import { getRandomTopicsFromArray } from '../../../lib/getRandomTopicsFromArray'
import { getArticleDescription } from '../../../utils/meta'
import { SharePopup, getShareUrl } from '../../Article/SharePopup'
import { Icon } from '../../_shared/Icon'
import { Newsletter } from '../../_shared/Newsletter'
import { AuthModal } from '../AuthModal'
import { ConfirmModal } from '../ConfirmModal'
import { HeaderAuth } from '../HeaderAuth'
import { Modal } from '../Modal'
import { SearchModal } from '../SearchModal/SearchModal'
import { Snackbar } from '../Snackbar'
import styles from './Header.module.scss'
import { Link } from './HeaderLink'

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

const handleSwitchLanguage = (event: { target: { value: string } }) => {
  location.href = `${location.href}${location.href.includes('?') ? '&' : '?'}lng=${event.target.value}`
}

export const Header = (props: Props) => {
  const { t, lang } = useLocalize()
  const { modal } = useUI()
  const { requireAuthentication } = useSession()
  const [searchParams] = useSearchParams<HeaderSearchParams>()
  const { sortedTopics: topics } = useTopics()
  const [randomTopics, setRandomTopics] = createSignal<Topic[]>([])
  const [getIsScrollingBottom, setIsScrollingBottom] = createSignal(false)
  const [getIsScrolled, setIsScrolled] = createSignal(false)
  const [fixed, setFixed] = createSignal(false)
  const [isSharePopupVisible, setIsSharePopupVisible] = createSignal(false)
  const [isProfilePopupVisible, setIsProfilePopupVisible] = createSignal(false)
  const [isKnowledgeBaseVisible, setIsKnowledgeBaseVisible] = createSignal(false)
  const [isTopicsVisible, setIsTopicsVisible] = createSignal(false)
  const [isZineVisible, setIsZineVisible] = createSignal(false)
  const [isFeedVisible, setIsFeedVisible] = createSignal(false)
  const { session } = useSession()
  const toggleFixed = () => setFixed(!fixed())

  const tag = (topic: Topic) =>
    /[ЁА-яё]/.test(topic.title || '') && lang() !== 'ru' ? topic.slug : topic.title

  let windowScrollTop = 0

  createEffect(() => {
    if (topics()?.length) {
      setRandomTopics(getRandomTopicsFromArray(topics()))
    }
  })

  createEffect(() => {
    const mainContent = document.querySelector<HTMLDivElement>('.main-content')

    if (fixed() || modal() !== null) {
      windowScrollTop = window?.scrollY || 0
      if (mainContent) mainContent.style.marginTop = `-${windowScrollTop}px`
    }

    document.body.classList.toggle('fixed', fixed() || modal() !== null)
    document.body.classList.toggle(styles.fixed, fixed() && !modal())

    if (!(fixed() || modal())) {
      window?.scrollTo(0, windowScrollTop)
      if (mainContent) mainContent.style.marginTop = ''
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

  const scrollToComments = (
    event: MouseEvent & { currentTarget: HTMLDivElement; target: Element },
    value: boolean
  ) => {
    event.preventDefault()
    props.scrollToComments?.(value)
  }

  const handleBookmarkButtonClick = (ev: { preventDefault: () => void }) => {
    requireAuthentication(() => {
      // TODO: implement bookmark clicked
      ev.preventDefault()
    }, 'bookmark')
  }

  const handleCreateButtonClick = (ev?: { preventDefault: () => void }) => {
    requireAuthentication(() => {
      ev?.preventDefault()

      redirect('/edit/new')
    }, 'create')
  }

  const toggleSubnavigation = (isShow: boolean, signal?: (b: boolean) => void) => {
    clearTimer()
    setIsKnowledgeBaseVisible(false)
    setIsTopicsVisible(false)
    setIsZineVisible(false)
    setIsFeedVisible(false)

    if (signal) {
      signal(isShow)
    }
  }

  let timer: string | number | NodeJS.Timeout

  const clearTimer = () => {
    clearTimeout(timer)
  }

  const hideSubnavigation = (_ev?: MouseEvent, time = 500) => {
    timer = setTimeout(() => {
      toggleSubnavigation(false)
    }, time)
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
        hideClose={searchParams?.source === 'authguard'}
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
            <A href="/">
              <img src="/logo.svg" alt={t('Discours')} />
            </A>
          </div>
          <div class={clsx('col col-md-13 col-lg-12 offset-xl-1', styles.mainNavigationWrapper)}>
            <Show when={props.title}>
              <div class={styles.articleHeader}>{props.title}</div>
            </Show>
            <div class={clsx(styles.mainNavigation, { [styles.fixed]: fixed() })}>
              <ul class="view-switcher" onClick={() => !fixed() && toggleFixed()}>
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsZineVisible)}
                  onMouseOut={hideSubnavigation}
                  href="/"
                  active={isZineVisible()}
                  body={t('Journal')}
                />
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsFeedVisible)}
                  onMouseOut={hideSubnavigation}
                  href="/feed"
                  active={isFeedVisible()}
                  body={t('Feed')}
                />
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsTopicsVisible)}
                  onMouseOut={hideSubnavigation}
                  href="/topic"
                  active={isTopicsVisible()}
                  body={t('Topics')}
                />
                <Link
                  onMouseOver={(event?: MouseEvent) => hideSubnavigation(event, 0)}
                  onMouseOut={(event?: MouseEvent) => hideSubnavigation(event, 0)}
                  href="/author"
                  body={t('Authors')}
                />
                <Link
                  onMouseOver={() => toggleSubnavigation(true, setIsKnowledgeBaseVisible)}
                  onMouseOut={() => hideSubnavigation}
                  href="/guide"
                  body={t('Knowledge base')}
                  active={isKnowledgeBaseVisible()}
                />
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
                    <A href="/support">{t('Support the project')}</A>
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
                  onChange={handleSwitchLanguage}
                  value={lang()}
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>

                <div class={styles.mainNavigationAdditionalLinks}>
                  <A href="/dogma">{t('Dogma')}</A>
                  <A href="/terms">{t('Discussion rules')}</A>
                  <A href="/principles">{t('Principles')}</A>
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
                description={getArticleDescription(props.articleBody?.slice(0, 100) || '')}
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
            classList={{ hidden: !isKnowledgeBaseVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
          >
            <ul class="nodash">
              <li>
                <A href="/manifest">{t('Manifesto')}</A>
              </li>
              <li>
                <A href="/dogma">{t('Dogma')}</A>
              </li>
              <li>
                <A href="/principles">{t('Our principles')}</A>
              </li>
              <li>
                <A href="/guide">{t('Platform Guide')}</A>
              </li>
              <li>
                <A href="/support">{t('Support us')}</A>
              </li>
              <li>
                <A href="/manifest#participation">{t('How to help')}</A>
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
            classList={{ hidden: !isZineVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
          >
            <ul class="nodash">
              <li class="item">
                <A href="/expo">{t('Art')}</A>
              </li>
              <li class="item">
                <A href="/expo/audio">{t('Music')}</A>
              </li>
              <li class="item">
                <A href="/expo/video">{t('Video')}</A>
              </li>
              <li class="item">
                <A href="/projects">{t('Special projects')}</A>
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
            classList={{ hidden: !isTopicsVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
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
            classList={{ hidden: !isFeedVisible() }}
            onMouseOver={clearTimer}
            onMouseOut={hideSubnavigation}
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
