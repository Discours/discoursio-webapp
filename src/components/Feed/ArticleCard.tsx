import { createMemo, createSignal, For, Show } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { capitalize } from '../../utils'
import { translit } from '../../utils/ru2en'
import { Icon } from '../_shared/Icon'
import styles from './ArticleCard.module.scss'
import { clsx } from 'clsx'
import { CardTopic } from './CardTopic'
import { ShoutRatingControl } from '../Article/ShoutRatingControl'
import { getShareUrl, SharePopup } from '../Article/SharePopup'
import stylesHeader from '../Nav/Header.module.scss'
import { getDescription } from '../../utils/meta'
import { FeedArticlePopup } from './FeedArticlePopup'
import { useLocalize } from '../../context/localize'
import { getPagePath, openPage } from '@nanostores/router'
import { router, useRouter } from '../../stores/router'
import { imageProxy } from '../../utils/imageProxy'
import { Popover } from '../_shared/Popover'

interface ArticleCardProps {
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
  }
  article: Shout
}

const getTitleAndSubtitle = (article: Shout): { title: string; subtitle: string } => {
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

export const ArticleCard = (props: ArticleCardProps) => {
  const { t, lang } = useLocalize()

  const mainTopic =
    props.article.topics.find((articleTopic) => articleTopic.slug === props.article.mainTopic) ||
    props.article.topics[0]

  const formattedDate = createMemo<string>(() => {
    return new Date(props.article.createdAt)
      .toLocaleDateString(lang(), { month: 'long', day: 'numeric', year: 'numeric' })
      .replace(' г.', '')
  })

  const { title, subtitle } = getTitleAndSubtitle(props.article)

  const { id, cover, layout, slug, authors, stat, body } = props.article

  const { changeSearchParam } = useRouter()
  const scrollToComments = (event) => {
    event.preventDefault()
    openPage(router, 'article', { slug })
    changeSearchParam('scrollTo', 'comments')
  }

  const [isSharePopupActive, setIsSharePopupActive] = createSignal(false)

  return (
    <section
      class={clsx(styles.shoutCard, `${props.settings?.additionalClass || ''}`)}
      classList={{
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
        [styles.shoutCardBeside]: props.settings?.isBeside
      }}
    >
      <Show when={!props.settings?.noimage && cover}>
        <div class={styles.shoutCardCoverContainer}>
          <div class={styles.shoutCardCover}>
            <img src={imageProxy(cover)} alt={title || ''} loading="lazy" />
          </div>
        </div>
      </Show>

      <div class={styles.shoutCardContent}>
        <Show when={layout && layout !== 'article' && !(props.settings?.noicon || props.settings?.noimage)}>
          <div class={styles.shoutCardType}>
            <a href={`/expo/${layout}`}>
              <Icon name={layout} class={styles.icon} />
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
          />
        </Show>

        <div class={styles.shoutCardTitlesContainer}>
          <a href={`/${slug || ''}`}>
            <div class={styles.shoutCardTitle}>
              <span class={styles.shoutCardLinkContainer}>{title}</span>
            </div>

            <Show when={!props.settings?.nosubtitle && subtitle}>
              <div class={styles.shoutCardSubtitle}>
                <span class={styles.shoutCardLinkContainer}>{subtitle}</span>
              </div>
            </Show>
          </a>
        </div>

        <Show when={!props.settings?.noauthor || !props.settings?.nodate}>
          <div class={styles.shoutDetails}>
            <Show when={!props.settings?.noauthor}>
              <div class={styles.shoutAuthor}>
                <For each={authors}>
                  {(author, index) => {
                    let name = author.name

                    if (lang() !== 'ru') {
                      name = name === 'Дискурс' ? 'Discours' : translit(name)
                    }

                    return (
                      <>
                        <Show when={index() > 0}>, </Show>
                        <a href={`/author/${author.slug}`}>{name}</a>
                      </>
                    )
                  }}
                </For>
              </div>
            </Show>
            <Show when={!props.settings?.nodate}>
              <div class={styles.shoutDate}>{formattedDate()}</div>
            </Show>
          </div>
        </Show>

        <Show when={props.settings?.isFeedMode}>
          <section
            class={styles.shoutCardDetails}
            classList={{ [styles.shoutCardDetailsActive]: isSharePopupActive() }}
          >
            <div class={styles.shoutCardDetailsContent}>
              <ShoutRatingControl shout={props.article} class={styles.shoutCardDetailsItem} />

              <div class={clsx(styles.shoutCardDetailsItem, styles.shoutCardDetailsViewed)}>
                <Icon name="eye" class={clsx(styles.icon, styles.feedControlIcon)} />
                {stat?.viewed}
              </div>

              <div class={clsx(styles.shoutCardDetailsItem, styles.shoutCardComments)}>
                <a href="#" onClick={(event) => scrollToComments(event)}>
                  <Icon name="comment" class={clsx(styles.icon, styles.feedControlIcon)} />
                  {stat?.commented || t('Add comment')}
                </a>
              </div>
            </div>

            <div class={styles.shoutCardDetailsContent}>
              <Popover content={t('Edit')}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutCardDetailsItem} ref={triggerRef}>
                    <a href={getPagePath(router, 'edit', { shoutId: id.toString() })}>
                      <Icon name="pencil-outline" class={clsx(styles.icon, styles.feedControlIcon)} />
                    </a>
                  </div>
                )}
              </Popover>

              <Popover content={t('Add to bookmarks')}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutCardDetailsItem} ref={triggerRef}>
                    <button>
                      <Icon name="bookmark" class={clsx(styles.icon, styles.feedControlIcon)} />
                    </button>
                  </div>
                )}
              </Popover>

              <Popover content={t('Share')}>
                {(triggerRef: (el) => void) => (
                  <div class={styles.shoutCardDetailsItem} ref={triggerRef}>
                    <SharePopup
                      containerCssClass={stylesHeader.control}
                      title={title}
                      description={getDescription(body)}
                      imageUrl={cover}
                      shareUrl={getShareUrl({ pathname: `/${slug}` })}
                      trigger={
                        <button>
                          <Icon name="share-outline" class={clsx(styles.icon, styles.feedControlIcon)} />
                        </button>
                      }
                    />
                  </div>
                )}
              </Popover>

              <div class={styles.shoutCardDetailsItem}>
                <FeedArticlePopup
                  containerCssClass={stylesHeader.control}
                  title={title}
                  description={getDescription(body)}
                  imageUrl={cover}
                  shareUrl={getShareUrl({ pathname: `/${slug}` })}
                  trigger={
                    <button>
                      <Icon name="ellipsis" class={clsx(styles.icon, styles.feedControlIcon)} />
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
