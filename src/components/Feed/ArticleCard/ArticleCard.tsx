import { createMemo, createSignal, For, Show } from 'solid-js'
import sanitizeHtml from 'sanitize-html'

import type { Shout } from '../../../graphql/types.gen'

import { getPagePath, openPage } from '@nanostores/router'
import { clsx } from 'clsx'
import { createMemo, createSignal, For, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { router, useRouter } from '../../../stores/router'
import { showModal } from '../../../stores/ui'
import { capitalize } from '../../../utils/capitalize'
import { getDescription } from '../../../utils/meta'
import { Icon } from '../../_shared/Icon'
import { Image } from '../../_shared/Image'
import { InviteCoAuthorsModal } from '../../_shared/InviteCoAuthorsModal'
import { Popover } from '../../_shared/Popover'
import { CoverImage } from '../../Article/CoverImage'
import { getShareUrl, SharePopup } from '../../Article/SharePopup'
import { ShoutRatingControl } from '../../Article/ShoutRatingControl'
import { AuthorLink } from '../../Author/AhtorLink'
import { CardTopic } from '../CardTopic'
import { FeedArticlePopup } from '../FeedArticlePopup'

import styles from './ArticleCard.module.scss'
import stylesHeader from '../../Nav/Header/Header.module.scss'

export type ArticleCardProps = {
  // TODO: refactor this, please
  settings?: {
    noicon?: boolean
    noimage?: boolean
    nosubtitle?: boolean
    noauthor?: boolean
    nodate?: boolean
    isGroup?: boolean
    photoBottom?: boolean
    additionalClass?: string
    isFeedMode?: boolean
    isFloorImportant?: boolean
    isWithCover?: boolean
    isBigTitle?: boolean
    isVertical?: boolean
    isShort?: boolean
    withBorder?: boolean
    isCompact?: boolean
    isSingle?: boolean
    isBeside?: boolean
    withViewed?: boolean
    noAuthorLink?: boolean
  }
  withAspectRatio?: boolean
  desktopCoverSize?: 'XS' | 'S' | 'M' | 'L'
  article: Shout
  onShare?: (article: Shout) => void
  onInvite?: () => void
}

const desktopCoverImageWidths: Record<ArticleCardProps['desktopCoverSize'], number> = {
  XS: 300,
  S: 400,
  M: 600,
  L: 800,
}

const getTitleAndSubtitle = (
  article: Shout,
): {
  title: string
  subtitle: string
} => {
  let title = article.title
  let subtitle = article.subtitle

  if (!subtitle) {
    let tt = article.title?.split('. ') || []

    if (tt?.length === 1) {
      tt = article.title?.split(/{!|\?|:|;}\s/) || []
    }

    if (tt && tt.length > 1) {
      const sep = article.title?.replace(tt[0], '').split(' ', 1)[0]
      title = tt[0] + (sep === '.' || sep === ':' ? '' : sep)
      subtitle = capitalize(article.title?.replace(tt[0] + sep, ''), true)
    }
  }

  return { title, subtitle }
}

const sanitizeString = (html) =>
  sanitizeHtml(html, {
    allowedTags: ['span'],
    allowedAttributes: {
      span: ['class']
    }
  })

export const ArticleCard = (props: ArticleCardProps) => {
  const { t, lang, formatDate } = useLocalize()
  const { user } = useSession()
  const mainTopic =
    props.article.topics.find((articleTopic) => articleTopic.slug === props.article.mainTopic) ||
    props.article.topics[0]

  const formattedDate = createMemo<string>(() => {
    return formatDate(new Date(props.article.createdAt))
  })

  const { title, subtitle } = getTitleAndSubtitle(props.article)

  const canEdit = () => props.article.authors?.some((a) => a.slug === user()?.slug)

  const { changeSearchParams } = useRouter()
  const scrollToComments = (event) => {
    event.preventDefault()
    openPage(router, 'article', { slug: props.article.slug })
    changeSearchParams({
      scrollTo: 'comments',
    })
  }

  const [isActionPopupActive, setIsActionPopupActive] = createSignal(false)
  const [isCoverImageLoadError, setIsCoverImageLoadError] = createSignal(false)
  const [isCoverImageLoading, setIsCoverImageLoading] = createSignal(true)

  const description = getDescription(props.article.body)

  const aspectRatio = () => {
    switch (props.article.layout) {
      case 'music': {
        return styles.aspectRatio1x1
      }
      case 'image': {
        return styles.aspectRatio4x3
      }
      case 'video':
      case 'literature': {
        return styles.aspectRatio16x9
      }
    }
  }

  return (
    <section
      class={clsx(styles.shoutCard, props.settings?.additionalClass, {
        [styles.shoutCardShort]: props.settings?.isShort,
        [styles.shoutCardPhotoBottom]: props.settings?.noimage && props.settings?.photoBottom,
        [styles.shoutCardFeed]: props.settings?.isFeedMode,
        [styles.shoutCardFloorImportant]: props.settings?.isFloorImportant,
        [styles.shoutCardWithCover]: props.settings?.isWithCover,
        [styles.shoutCardBigTitle]: props.settings?.isBigTitle,
        [styles.shoutCardVertical]: props.settings?.isVertical,
        [styles.shoutCardWithBorder]: props.settings?.withBorder,
        [styles.shoutCardCompact]: props.settings?.isCompact,
        [styles.shoutCardSingle]: props.settings?.isSingle,
        [styles.shoutCardBeside]: props.settings?.isBeside,
        [styles.shoutCardNoImage]: !props.article.cover,
        [aspectRatio()]: props.withAspectRatio,
      })}
    >
      <Show when={!props.settings?.noimage && !props.settings?.isFeedMode}>
        <div class={styles.shoutCardCoverContainer}>
          <div
            class={clsx(styles.shoutCardCover, {
              [styles.loading]: props.article.cover && isCoverImageLoading(),
            })}
          >
            <Show
              when={props.article.cover && !isCoverImageLoadError()}
              fallback={<CoverImage class={styles.placeholderCoverImage} />}
            >
              <Image
                src={props.article.cover}
                alt={title}
                width={desktopCoverImageWidths[props.desktopCoverSize]}
                onError={() => {
                  setIsCoverImageLoadError(true)
                  setIsCoverImageLoading(false)
                }}
                onLoad={() => setIsCoverImageLoading(false)}
              />
            </Show>
          </div>
        </div>
      </Show>
      <div class={styles.shoutCardContent}>
        <Show
          when={
            props.article.layout &&
            props.article.layout !== 'article' &&
            !(props.settings?.noicon || props.settings?.noimage) &&
            !props.settings?.isFeedMode
          }
        >
          <div class={styles.shoutCardType}>
            <a href={`/expo/${props.article.layout}`}>
              <Icon name={props.article.layout} class={styles.icon} />
              {/*<Icon name={`${layout}-hover`} class={clsx(styles.icon, styles.iconHover)} />*/}
            </a>
          </div>
        </Show>

        <Show when={!props.settings?.isGroup && mainTopic}>
          <CardTopic
            title={
              lang() === 'ru' && mainTopic.title ? mainTopic.title : mainTopic?.slug?.replace('-', ' ')
            }
            slug={mainTopic.slug}
            isFloorImportant={props.settings?.isFloorImportant}
            isFeedMode={true}
            class={clsx(styles.shoutTopic, { [styles.shoutTopicTop]: props.settings.isShort })}
          />
        </Show>

        <div
          class={clsx(styles.shoutCardTitlesContainer, {
            [styles.shoutCardTitlesContainerFeedMode]: props.settings?.isFeedMode,
          })}
        >
          <a href={getPagePath(router, 'article', { slug: props.article.slug })}>
            <div class={styles.shoutCardTitle}>
              <span class={styles.shoutCardLinkWrapper}>
                <span class={styles.shoutCardLinkContainer} innerHTML={sanitizeString(title)} />
              </span>
            </div>

            <Show when={!props.settings?.nosubtitle && subtitle}>
              <div class={styles.shoutCardSubtitle}>
                <span class={styles.shoutCardLinkContainer} innerHTML={sanitizeString(subtitle)} />
              </div>
            </Show>
          </a>
        </div>
        <Show when={!props.settings?.noauthor || !props.settings?.nodate}>
          <div
            class={clsx(styles.shoutDetails, { [styles.shoutDetailsFeedMode]: props.settings?.isFeedMode })}
          >
            <Show when={!props.settings?.noauthor}>
              <div class={styles.shoutAuthor}>
                <For each={props.article.authors}>
                  {(author) => {
                    return (
                      <AuthorLink
                        size={'XS'}
                        author={author}
                        isFloorImportant={props.settings.isFloorImportant || props.settings?.isWithCover}
                      />
                    )
                  }}
                </For>
              </div>
            </Show>
            <Show when={!props.settings?.nodate}>
              <time class={styles.shoutDate}>{formattedDate()}</time>
            </Show>
          </div>
        </Show>
        <Show when={props.article.description}>
          <section
            class={styles.shoutCardDescription}
            innerHTML={sanitizeString(props.article.description)}
          />
        </Show>
        <Show when={props.settings?.isFeedMode}>
          <Show when={props.article.description}>
            <section class={styles.shoutCardDescription} innerHTML={props.article.description} />
          </Show>
          <Show when={!props.settings?.noimage && props.article.cover}>
            <div class={styles.shoutCardCoverContainer}>
              <Show
                when={
                  props.article.layout &&
                  props.article.layout !== 'article' &&
                  !(props.settings?.noicon || props.settings?.noimage)
                }
              >
                <div class={styles.shoutCardType}>
                  <a href={`/expo/${props.article.layout}`}>
                    <Icon name={props.article.layout} class={styles.icon} />
                    {/*<Icon name={`${layout}-hover`} class={clsx(styles.icon, styles.iconHover)} />*/}
                  </a>
                </div>
              </Show>
              <div class={styles.shoutCardCover}>
                <Image src={props.article.cover} alt={title} width={600} loading="lazy" />
              </div>
            </div>
          </Show>

          <section
            class={styles.shoutCardDetails}
            classList={{ [styles.shoutCardDetailsActive]: isActionPopupActive() }}
          >
            <div class={styles.shoutCardDetailsContent}>
              <ShoutRatingControl shout={props.article} class={styles.shoutCardDetailsItem} />

              <div class={clsx(styles.shoutCardDetailsItem, styles.shoutCardComments)}>
                <a href="#" onClick={(event) => scrollToComments(event)}>
                  <Icon name="comment" class={clsx(styles.icon, styles.feedControlIcon)} />
                  <Icon
                    name="comment-hover"
                    class={clsx(styles.icon, styles.iconHover, styles.feedControlIcon)}
                  />
                  <Show
                    when={props.article.stat?.commented}
                    fallback={
                      <span class={clsx(styles.shoutCardLinkContainer, styles.shoutCardDetailsItemLabel)}>
                        {t('Add comment')}
                      </span>
                    }
                  >
                    {props.article.stat?.commented}
                  </Show>
                </a>
              </div>

              <Show when={props.settings?.withViewed}>
                <div class={clsx(styles.shoutCardDetailsItem, styles.shoutCardDetailsViewed)}>
                  <Icon name="eye" class={clsx(styles.icon, styles.feedControlIcon)} />
                  {props.article.stat?.viewed}
                </div>
              </Show>
            </div>

            <div class={styles.shoutCardDetailsContent}>
              <Show when={canEdit()}>
                <Popover content={t('Edit')} disabled={isActionPopupActive()}>
                  {(triggerRef: (el) => void) => (
                    <div class={styles.shoutCardDetailsItem} ref={triggerRef}>
                      <a href={getPagePath(router, 'edit', { shoutId: props.article.id.toString() })}>
                        <Icon name="pencil-outline" class={clsx(styles.icon, styles.feedControlIcon)} />
                        <Icon
                          name="pencil-outline-hover"
                          class={clsx(styles.icon, styles.iconHover, styles.feedControlIcon)}
                        />
                      </a>
                    </div>
                  )}
                </Popover>
              </Show>

              <Popover content={t('Add to bookmarks')} disabled={isActionPopupActive()}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutCardDetailsItem} ref={triggerRef}>
                    <button>
                      <Icon name="bookmark" class={clsx(styles.icon, styles.feedControlIcon)} />
                      <Icon
                        name="bookmark-hover"
                        class={clsx(styles.icon, styles.iconHover, styles.feedControlIcon)}
                      />
                    </button>
                  </div>
                )}
              </Popover>

              <Popover content={t('Share')} disabled={isActionPopupActive()}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutCardDetailsItem} ref={triggerRef}>
                    <SharePopup
                      containerCssClass={stylesHeader.control}
                      title={title}
                      description={description}
                      imageUrl={props.article.cover}
                      shareUrl={getShareUrl({ pathname: `/${props.article.slug}` })}
                      onVisibilityChange={(isVisible) => setIsActionPopupActive(isVisible)}
                      trigger={
                        <button>
                          <Icon name="share-outline" class={clsx(styles.icon, styles.feedControlIcon)} />
                          <Icon
                            name="share-outline-hover"
                            class={clsx(styles.icon, styles.iconHover, styles.feedControlIcon)}
                          />
                        </button>
                      }
                    />
                  </div>
                )}
              </Popover>

              <div class={styles.shoutCardDetailsItem}>
                <FeedArticlePopup
                  isOwner={canEdit()}
                  containerCssClass={stylesHeader.control}
                  onShareClick={() => props.onShare(props.article)}
                  onInviteClick={props.onInvite}
                  onVisibilityChange={(isVisible) => setIsActionPopupActive(isVisible)}
                  trigger={
                    <button>
                      <Icon name="ellipsis" class={clsx(styles.icon, styles.feedControlIcon)} />
                      <Icon
                        name="ellipsis"
                        class={clsx(styles.icon, styles.iconHover, styles.feedControlIcon)}
                      />
                    </button>
                  }
                />
              </div>
            </div>
          </section>
        </Show>
      </div>
    </section>
  )
}
