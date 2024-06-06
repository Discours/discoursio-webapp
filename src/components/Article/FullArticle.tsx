import type { Author, Shout, Topic } from '../../graphql/schema/core.gen'

import { getPagePath } from '@nanostores/router'
import { createPopper } from '@popperjs/core'
import { clsx } from 'clsx'
import { install } from 'ga-gtag'
import { For, Show, createEffect, createMemo, createSignal, on, onCleanup, onMount } from 'solid-js'
import { isServer } from 'solid-js/web'
import { Link, Meta } from '../../context/meta'

import { useLocalize } from '../../context/localize'
import { useReactions } from '../../context/reactions'
import { useSession } from '../../context/session'
import { MediaItem } from '../../pages/types'
import { DEFAULT_HEADER_OFFSET, router, useRouter } from '../../stores/router'
import { showModal } from '../../stores/ui'
import { capitalize } from '../../utils/capitalize'
import { getImageUrl, getOpenGraphImageUrl } from '../../utils/getImageUrl'
import { getDescription, getKeywords } from '../../utils/meta'
import { isCyrillic } from '../../utils/translate'
import { AuthorBadge } from '../Author/AuthorBadge'
import { CardTopic } from '../Feed/CardTopic'
import { FeedArticlePopup } from '../Feed/FeedArticlePopup'
import { Modal } from '../Nav/Modal'
import { TableOfContents } from '../TableOfContents'
import { Icon } from '../_shared/Icon'
import { Image } from '../_shared/Image'
import { InviteMembers } from '../_shared/InviteMembers'
import { Lightbox } from '../_shared/Lightbox'
import { Popover } from '../_shared/Popover'
import { ShareModal } from '../_shared/ShareModal'
import { ImageSwiper } from '../_shared/SolidSwiper'
import { VideoPlayer } from '../_shared/VideoPlayer'

import { AudioHeader } from './AudioHeader'
import { AudioPlayer } from './AudioPlayer'
import { CommentsTree } from './CommentsTree'
import { SharePopup, getShareUrl } from './SharePopup'
import { ShoutRatingControl } from './ShoutRatingControl'

import { useSeen } from '../../context/seen'
import stylesHeader from '../Nav/Header/Header.module.scss'
import styles from './Article.module.scss'

type Props = {
  article: Shout
  scrollToComments?: boolean
}

type IframeSize = {
  width: number
  height: number
}

export type ArticlePageSearchParams = {
  scrollTo: 'comments'
  commentId: string
  slide?: string
}

const scrollTo = (el: HTMLElement) => {
  const { top } = el.getBoundingClientRect()
  window.scrollTo({
    top: top + window.scrollY - DEFAULT_HEADER_OFFSET,
    left: 0,
    behavior: 'smooth',
  })
}

const imgSrcRegExp = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi

export const FullArticle = (props: Props) => {
  const { searchParams, changeSearchParams } = useRouter<ArticlePageSearchParams>()
  const { loadReactionsBy } = useReactions()
  const [selectedImage, setSelectedImage] = createSignal('')
  const [isReactionsLoaded, setIsReactionsLoaded] = createSignal(false)
  const [isActionPopupActive, setIsActionPopupActive] = createSignal(false)
  const { t, formatDate, lang } = useLocalize()
  const { author, session, requireAuthentication } = useSession()
  const { addSeen } = useSeen()

  const formattedDate = createMemo(() => formatDate(new Date(props.article.published_at * 1000)))

  const canEdit = createMemo(
    () =>
      Boolean(author()?.id) &&
      (props.article?.authors?.some((a) => Boolean(a) && a?.id === author().id) ||
        props.article?.created_by?.id === author().id ||
        session()?.user?.roles.includes('editor')),
  )

  const mainTopic = createMemo(() => {
    const mainTopicSlug = props.article.topics.length > 0 ? props.article.main_topic : null
    const mt = props.article.topics.find((tpc: Topic) => tpc.slug === mainTopicSlug)
    if (mt) {
      mt.title = lang() === 'en' ? capitalize(mt.slug.replace(/-/, ' ')) : mt.title
      return mt
    }
    return props.article.topics[0]
  })

  const handleBookmarkButtonClick = (ev) => {
    requireAuthentication(() => {
      // TODO: implement bookmark clicked
      ev.preventDefault()
    }, 'bookmark')
  }

  const body = createMemo(() => {
    if (props.article.layout === 'literature') {
      try {
        if (props.article?.media) {
          const media = JSON.parse(props.article.media)
          if (media.length > 0) {
            return media[0].body
          }
        }
      } catch (error) {
        console.error(error)
      }
    }
    return props.article.body
  })

  const imageUrls = createMemo(() => {
    if (!body()) {
      return []
    }

    if (isServer) {
      const result: string[] = []
      let match: RegExpMatchArray

      while ((match = imgSrcRegExp.exec(body())) !== null) {
        result.push(match[1])
      }
      return result
    }

    const imageElements = document.querySelectorAll<HTMLImageElement>('#shoutBody img')
    // eslint-disable-next-line unicorn/prefer-spread
    return Array.from(imageElements).map((img) => img.src)
  })

  const media = createMemo<MediaItem[]>(() => {
    try {
      return JSON.parse(props.article?.media || '[]')
    } catch {
      return []
    }
  })

  const commentsRef: {
    current: HTMLDivElement
  } = { current: null }

  createEffect(() => {
    if (searchParams().commentId && isReactionsLoaded()) {
      const commentElement = document.querySelector<HTMLElement>(
        `[id='comment_${searchParams().commentId}']`,
      )

      if (commentElement) {
        requestAnimationFrame(() => scrollTo(commentElement))
      }
    }
  })

  const clickHandlers = []
  const documentClickHandlers = []

  createEffect(() => {
    if (!body()) {
      return
    }

    const tooltipElements: NodeListOf<HTMLElement> = document.querySelectorAll(
      '[data-toggle="tooltip"], footnote',
    )
    if (!tooltipElements) {
      return
    }
    tooltipElements.forEach((element) => {
      const tooltip = document.createElement('div')
      tooltip.classList.add(styles.tooltip)
      const tooltipContent = document.createElement('div')
      tooltipContent.classList.add(styles.tooltipContent)
      tooltipContent.innerHTML = element.dataset.originalTitle || element.dataset.value

      tooltip.append(tooltipContent)

      document.body.append(tooltip)

      if (element.hasAttribute('href')) {
        element.setAttribute('href', 'javascript: void(0)')
      }

      const popperInstance = createPopper(element, tooltip, {
        placement: 'top',
        modifiers: [
          {
            name: 'eventListeners',
            options: { scroll: false },
          },
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'flip',
            options: { fallbackPlacements: ['top'] },
          },
        ],
      })

      tooltip.style.visibility = 'hidden'
      let isTooltipVisible = false
      const handleClick = () => {
        if (isTooltipVisible) {
          tooltip.style.visibility = 'hidden'
          isTooltipVisible = false
        } else {
          tooltip.style.visibility = 'visible'
          isTooltipVisible = true
        }

        popperInstance.update()
      }

      const handleDocumentClick = (e) => {
        if (isTooltipVisible && e.target !== element && e.target !== tooltip) {
          tooltip.style.visibility = 'hidden'
          isTooltipVisible = false
        }
      }

      element.addEventListener('click', handleClick)
      document.addEventListener('click', handleDocumentClick)

      clickHandlers.push({ element, handler: handleClick })
      documentClickHandlers.push(handleDocumentClick)
    })
  })

  onCleanup(() => {
    clickHandlers.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler)
    })
    documentClickHandlers.forEach((handler) => {
      document.removeEventListener('click', handler)
    })
  })

  const openLightbox = (image) => {
    setSelectedImage(image)
  }
  const handleLightboxClose = () => {
    setSelectedImage()
  }

  const handleArticleBodyClick = (event) => {
    if (event.target.tagName === 'IMG' && !event.target.dataset.disableLightbox) {
      const src = event.target.src
      openLightbox(getImageUrl(src))
    }
  }

  // Check iframes size
  const articleContainer: { current: HTMLElement } = { current: null }
  const updateIframeSizes = () => {
    if (!(articleContainer?.current && props.article.body)) return
    const iframes = articleContainer?.current?.querySelectorAll('iframe')
    if (!iframes) return
    const containerWidth = articleContainer.current?.offsetWidth
    iframes.forEach((iframe) => {
      const style = window.getComputedStyle(iframe)
      const originalWidth = iframe.getAttribute('width') || style.width.replace('px', '')
      const originalHeight = iframe.getAttribute('height') || style.height.replace('px', '')

      const width: IframeSize['width'] = Number(originalWidth)
      const height: IframeSize['height'] = Number(originalHeight)

      if (containerWidth < width) {
        const aspectRatio = width / height
        iframe.style.width = `${containerWidth}px`
        iframe.style.height = `${Math.round(containerWidth / aspectRatio) + 40}px`
      } else {
        iframe.style.height = `${containerWidth}px`
      }
    })
  }

  createEffect(
    on(
      () => props.article,
      () => {
        updateIframeSizes()
      },
    ),
  )

  onMount(async () => {
    install('G-LQ4B87H8C2')
    await loadReactionsBy({ by: { shout: props.article.slug } })
    addSeen(props.article.slug)
    setIsReactionsLoaded(true)
    document.title = props.article.title
    window?.addEventListener('resize', updateIframeSizes)

    onCleanup(() => window.removeEventListener('resize', updateIframeSizes))

    createEffect(() => {
      if (props.scrollToComments) {
        scrollTo(commentsRef.current)
      }
    })

    createEffect(() => {
      if (searchParams()?.scrollTo === 'comments' && commentsRef.current) {
        requestAnimationFrame(() => scrollTo(commentsRef.current))
        changeSearchParams({ scrollTo: null })
      }
    })
  })

  const cover = props.article.cover ?? 'production/image/logo_image.png'
  const ogImage = getOpenGraphImageUrl(cover, {
    title: props.article.title,
    topic: mainTopic()?.title || '',
    author: props.article?.authors[0]?.name || '',
    width: 1200,
  })

  const description = getDescription(props.article.description || body() || media()[0]?.body)
  const ogTitle = props.article.title
  const keywords = getKeywords(props.article)
  const shareUrl = getShareUrl({ pathname: `/${props.article.slug}` })
  const getAuthorName = (a: Author) => {
    return lang() === 'en' && isCyrillic(a.name) ? capitalize(a.slug.replace(/-/, ' ')) : a.name
  }
  return (
    <>
      <Meta name="descprition" content={description} />
      <Meta name="keywords" content={keywords} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={ogTitle} />
      <Meta name="og:image" content={ogImage} />
      <Meta name="og:description" content={description} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={ogTitle} />
      <Meta name="twitter:description" content={description} />
      <Meta name="twitter:image" content={ogImage} />

      <For each={imageUrls()}>{(imageUrl) => <Link rel="preload" as="image" href={imageUrl} />}</For>
      <div class="wide-container">
        <div class="row position-relative">
          <article
            ref={(el) => (articleContainer.current = el)}
            class={clsx('col-md-16 col-lg-14 col-xl-12 offset-md-5', styles.articleContent)}
            onClick={handleArticleBodyClick}
          >
            {/*TODO: Check styles.shoutTopic*/}
            <Show when={props.article.layout !== 'audio'}>
              <div class={styles.shoutHeader}>
                <Show when={mainTopic()}>
                  <CardTopic title={mainTopic().title} slug={mainTopic().slug} />
                </Show>

                <h1>{props.article.title}</h1>
                <Show when={props.article.subtitle}>
                  <h4>{props.article.subtitle}</h4>
                </Show>

                <div class={styles.shoutAuthor}>
                  <For each={props.article.authors}>
                    {(a: Author, index) => (
                      <>
                        <Show when={index() > 0}>, </Show>
                        <a href={getPagePath(router, 'author', { slug: a.slug })}>{getAuthorName(a)}</a>
                      </>
                    )}
                  </For>
                </div>
                <Show
                  when={
                    props.article.cover &&
                    props.article.layout !== 'video' &&
                    props.article.layout !== 'image'
                  }
                >
                  <figure class="img-align-column">
                    <Image width={800} alt={props.article.cover_caption} src={props.article.cover} />
                    <figcaption innerHTML={props.article.cover_caption} />
                  </figure>
                </Show>
              </div>
            </Show>
            <Show when={props.article.lead}>
              <section class={styles.lead} innerHTML={props.article.lead} />
            </Show>
            <Show when={props.article.layout === 'audio'}>
              <AudioHeader
                title={props.article.title}
                cover={props.article.cover}
                artistData={media()?.[0]}
                topic={mainTopic()}
              />
              <Show when={media().length > 0}>
                <div class="media-items">
                  <AudioPlayer media={media()} articleSlug={props.article.slug} body={body()} />
                </div>
              </Show>
            </Show>
            <Show when={media() && props.article.layout === 'video'}>
              <div class="media-items">
                <For each={media() || []}>
                  {(m: MediaItem) => (
                    <div class={styles.shoutMediaBody}>
                      <VideoPlayer
                        articleView={true}
                        videoUrl={m.url}
                        title={m.title}
                        description={m.body}
                      />
                      <Show when={m?.body}>
                        <div innerHTML={m.body} />
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            <Show when={body()}>
              <div id="shoutBody" class={styles.shoutBody} innerHTML={body()} />
            </Show>
          </article>

          <Show when={body()}>
            <div class="col-md-6 offset-md-1">
              <TableOfContents variant="article" parentSelector="#shoutBody" body={body()} />
            </div>
          </Show>
        </div>
      </div>

      <Show when={props.article.layout === 'image'}>
        <div class="floor floor--important">
          <div class="wide-container">
            <div class="row">
              <div class="col-md-20 offset-md-2">
                <ImageSwiper images={media()} />
              </div>
            </div>
          </div>
        </div>
      </Show>

      <div class="wide-container">
        <div class="row">
          <div class="col-md-16 offset-md-5">
            <div class={styles.shoutStats}>
              <div class={styles.shoutStatsItem}>
                <ShoutRatingControl shout={props.article} class={styles.ratingControl} />
              </div>

              <Popover content={t('Comment')} disabled={isActionPopupActive()}>
                {(triggerRef: (el) => void) => (
                  <div
                    class={clsx(styles.shoutStatsItem)}
                    ref={triggerRef}
                    onClick={() => scrollTo(commentsRef.current)}
                  >
                    <Icon name="comment" class={styles.icon} />
                    <Icon name="comment-hover" class={clsx(styles.icon, styles.iconHover)} />
                    <Show
                      when={props.article.stat?.commented}
                      fallback={<span class={styles.commentsTextLabel}>{t('Add comment')}</span>}
                    >
                      {props.article.stat?.commented}
                    </Show>
                  </div>
                )}
              </Popover>

              <Show when={props.article.stat?.viewed}>
                <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemViews)}>
                  {t('some views', { count: props.article.stat?.viewed })}
                </div>
              </Show>

              <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalData)}>
                <div class={clsx(styles.shoutStatsItem, styles.shoutStatsItemAdditionalDataItem)}>
                  {formattedDate()}
                </div>
              </div>

              <Popover content={t('Add to bookmarks')} disabled={isActionPopupActive()}>
                {(triggerRef: (el) => void) => (
                  <div
                    class={clsx(styles.shoutStatsItem, styles.shoutStatsItemBookmarks)}
                    ref={triggerRef}
                    onClick={handleBookmarkButtonClick}
                  >
                    <div class={styles.shoutStatsItemInner}>
                      <Icon name="bookmark" class={styles.icon} />
                      <Icon name="bookmark-hover" class={clsx(styles.icon, styles.iconHover)} />
                    </div>
                  </div>
                )}
              </Popover>

              <Popover content={t('Share')} disabled={isActionPopupActive()}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutStatsItem} ref={triggerRef}>
                    <SharePopup
                      title={props.article.title}
                      description={description}
                      imageUrl={props.article.cover}
                      shareUrl={shareUrl}
                      containerCssClass={stylesHeader.control}
                      onVisibilityChange={(isVisible) => setIsActionPopupActive(isVisible)}
                      trigger={
                        <div class={styles.shoutStatsItemInner}>
                          <Icon name="share-outline" class={styles.icon} />
                          <Icon name="share-outline-hover" class={clsx(styles.icon, styles.iconHover)} />
                        </div>
                      }
                    />
                  </div>
                )}
              </Popover>

              <Show when={canEdit()}>
                <Popover content={t('Edit')}>
                  {(triggerRef: (el) => void) => (
                    <div class={styles.shoutStatsItem} ref={triggerRef}>
                      <a
                        href={getPagePath(router, 'edit', { shoutId: props.article?.id.toString() })}
                        class={styles.shoutStatsItemInner}
                      >
                        <Icon name="pencil-outline" class={styles.icon} />
                        <Icon name="pencil-outline-hover" class={clsx(styles.icon, styles.iconHover)} />
                      </a>
                    </div>
                  )}
                </Popover>
              </Show>

              <FeedArticlePopup
                canEdit={canEdit()}
                containerCssClass={clsx(stylesHeader.control, styles.articlePopupOpener)}
                onShareClick={() => showModal('share')}
                onInviteClick={() => showModal('inviteMembers')}
                onVisibilityChange={(isVisible) => setIsActionPopupActive(isVisible)}
                trigger={
                  <button>
                    <Icon name="ellipsis" class={clsx(styles.icon)} />
                    <Icon name="ellipsis" class={clsx(styles.icon, styles.iconHover)} />
                  </button>
                }
              />
            </div>

            <Show when={author()?.id && !canEdit()}>
              <div class={styles.help}>
                <button class="button">{t('Cooperate')}</button>
              </div>
            </Show>
            <Show when={canEdit()}>
              <div class={styles.help}>
                <button class="button button--light">{t('Invite to collab')}</button>
              </div>
            </Show>

            <Show when={props.article.topics.length}>
              <div class={styles.topicsList}>
                <For each={props.article.topics}>
                  {(topic) => (
                    <div class={styles.shoutTopic}>
                      <a href={getPagePath(router, 'topic', { slug: topic.slug })}>
                        {lang() === 'en' ? capitalize(topic.slug) : topic.title}
                      </a>
                    </div>
                  )}
                </For>
              </div>
            </Show>

            <div class={styles.shoutAuthorsList}>
              <Show when={props.article.authors.length > 1}>
                <h4>{t('Authors')}</h4>
              </Show>
              <For each={props.article.authors}>
                {(a: Author) => (
                  <div class="col-xl-12">
                    <AuthorBadge iconButtons={true} showMessageButton={true} author={a} />
                  </div>
                )}
              </For>
            </div>
            <div id="comments" ref={(el) => (commentsRef.current = el)}>
              <Show when={isReactionsLoaded()}>
                <CommentsTree
                  shoutId={props.article.id}
                  shoutSlug={props.article.slug}
                  articleAuthors={props.article.authors}
                />
              </Show>
            </div>
          </div>
        </div>
      </div>
      <Show when={selectedImage()}>
        <Lightbox image={selectedImage()} onClose={handleLightboxClose} />
      </Show>
      <Modal variant="medium" name="inviteMembers">
        <InviteMembers variant={'coauthors'} title={t('Invite experts')} />
      </Modal>
      <ShareModal
        title={props.article.title}
        description={description}
        imageUrl={props.article.cover}
        shareUrl={shareUrl}
      />
    </>
  )
}
