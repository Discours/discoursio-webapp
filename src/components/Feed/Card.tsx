import { t } from '../../utils/intl'
import { createMemo, For, Show } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import { capitalize } from '../../utils'
import { translit } from '../../utils/ru2en'
import { Icon } from '../_shared/Icon'
import styles from './Card.module.scss'
import { locale } from '../../stores/ui'
import { clsx } from 'clsx'
import CardTopic from './CardTopic'

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
  const mainTopic = props.article.topics.find(
    (articleTopic) => articleTopic.slug === props.article.mainTopic
  )

  const formattedDate = createMemo<string>(() => {
    return new Date(props.article.createdAt)
      .toLocaleDateString(locale(), { month: 'long', day: 'numeric', year: 'numeric' })
      .replace(' г.', '')
  })

  const { title, subtitle } = getTitleAndSubtitle(props.article)

  const { cover, layout, slug, authors, stat } = props.article

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
            <img src={cover || ''} alt={title || ''} loading="lazy" />
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

        <Show when={!props.settings?.isGroup}>
          <CardTopic
            title={
              locale() === 'ru' && mainTopic.title ? mainTopic.title : mainTopic.slug.replace('-', ' ')
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
                    const name =
                      author.name === 'Дискурс' && locale() !== 'ru'
                        ? 'Discours'
                        : translit(author.name || '', locale() || 'ru')

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
          <section class={styles.shoutCardDetails}>
            <div class={styles.shoutCardDetailsContent}>
              <div class={clsx(styles.shoutCardDetailsItem, styles.rating)}>
                <button class={styles.ratingControl}>&minus;</button>
                <span class={styles.ratingValue}>{stat?.rating || ''}</span>
                <button class={styles.ratingControl}>+</button>
              </div>
              <div
                class={clsx(
                  styles.shoutCardDetailsItem,
                  styles.shoutCardDetailsViewed,
                  styles.shoutCardComments
                )}
              >
                <Icon name="eye" class={styles.icon} />
                {stat?.viewed}
              </div>
              <div class={clsx(styles.shoutCardDetailsItem, styles.shoutCardComments)}>
                <a href={`/${slug + '#comments' || ''}`}>
                  <Icon name="comment" class={styles.icon} />
                  {stat?.commented || ''}
                </a>
              </div>

              <div class={styles.shoutCardDetailsItem}>
                <button>
                  <Icon name="bookmark" class={styles.icon} />
                </button>
              </div>

              <div class={styles.shoutCardDetailsItem}>
                <button>
                  <Icon name="ellipsis" class={styles.icon} />
                </button>
              </div>
            </div>

            <button class={clsx('button--light', styles.shoutCardEditControl)}>{t('Collaborate')}</button>
          </section>
        </Show>
      </div>
    </section>
  )
}
