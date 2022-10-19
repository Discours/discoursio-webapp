import { t } from '../../utils/intl'
import { createMemo } from 'solid-js'
import { For, Show } from 'solid-js/web'
import type { Shout } from '../../graphql/types.gen'
import { capitalize } from '../../utils'
import { translit } from '../../utils/ru2en'
import { Icon } from '../Nav/Icon'
import style from './Card.module.scss'
import { locale } from '../../stores/ui'
import { handleClientRouteLinkClick } from '../../stores/router'
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
      title = tt[0] + (!(sep === '.' || sep === ':') ? sep : '')
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
      class={clsx(style.shoutCard, `${props.settings?.additionalClass || ''}`)}
      classList={{
        [style.shoutCardShort]: props.settings?.isShort,
        [style.shoutCardPhotoBottom]: props.settings?.noimage && props.settings?.photoBottom,
        [style.shoutCardFeed]: props.settings?.isFeedMode,
        [style.shoutCardFloorImportant]: props.settings?.isFloorImportant,
        [style.shoutCardWithCover]: props.settings?.isWithCover,
        [style.shoutCardBigTitle]: props.settings?.isBigTitle,
        [style.shoutCardVertical]: props.settings?.isVertical,
        [style.shoutCardWithBorder]: props.settings?.withBorder,
        [style.shoutCardCompact]: props.settings?.isCompact,
        [style.shoutCardSingle]: props.settings?.isSingle
      }}
    >
      <Show when={!props.settings?.noimage && cover}>
        <div class={style.shoutCardCoverContainer}>
          <div class={style.shoutCardCover}>
            <img src={cover || ''} alt={title || ''} loading="lazy" />
          </div>
        </div>
      </Show>

      <div class={style.shoutCardContent}>
        <Show when={layout && layout !== 'article' && !(props.settings?.noicon || props.settings?.noimage)}>
          <div class={style.shoutCardType}>
            <a href={`/topic/${mainTopic.slug}`}>
              <Icon name={layout} class={style.icon} />
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

        <div class={style.shoutCardTitlesContainer}>
          <a href={`/${slug || ''}`} onClick={handleClientRouteLinkClick}>
            <div class={style.shoutCardTitle}>
              <span class={style.shoutCardLinkContainer}>{title}</span>
            </div>

            <Show when={!props.settings?.nosubtitle && subtitle}>
              <div class={style.shoutCardSubtitle}>
                <span class={style.shoutCardLinkContainer}>{subtitle}</span>
              </div>
            </Show>
          </a>
        </div>

        <Show when={!props.settings?.noauthor || !props.settings?.nodate}>
          <div class={style.shoutDetails}>
            <Show when={!props.settings?.noauthor}>
              <div class={style.shoutAuthor}>
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
              <div class={style.shoutDate}>{formattedDate()}</div>
            </Show>
          </div>
        </Show>

        <Show when={props.settings?.isFeedMode}>
          <section class={style.shoutCardDetails}>
            <div class={style.shoutCardDetailsContent}>
              <div class={clsx(style.shoutCardDetailsItem, 'rating')}>
                <button class="rating__control">&minus;</button>
                <span class="rating__value">{stat?.rating || ''}</span>
                <button class="rating__control">+</button>
              </div>
              <div class={clsx(style.shoutCardDetailsItem, style.shoutCardComments)}>
                <Icon name="eye" class={style.icon} />
                {stat?.viewed}
              </div>
              <div class={clsx(style.shoutCardDetailsTtem, style.shoutCardComments)}>
                <a href={`/${slug + '#comments' || ''}`}>
                  <Icon name="comment" class={style.icon} />
                  {stat?.commented || ''}
                </a>
              </div>

              <div class={style.shoutCardDetailsItem}>
                <button>
                  <Icon name="bookmark" class={style.icon} />
                </button>
              </div>

              <div class={style.shoutCardDetailsItem}>
                <button>
                  <Icon name="ellipsis" class={style.icon} />
                </button>
              </div>
            </div>

            <button class="button--light shout-card__edit-control">{t('Collaborate')}</button>
          </section>
        </Show>
      </div>
    </section>
  )
}
