import { t } from '../../utils/intl'
import { createMemo } from 'solid-js'
import { For, Show } from 'solid-js/web'
import type { Shout } from '../../graphql/types.gen'
import { capitalize } from '../../utils'
import { translit } from '../../utils/ru2en'
import Icon from '../Nav/Icon'
import './Card.scss'
import { locale as localestore } from '../../stores/ui'
import { useStore } from '@nanostores/solid'
import { handleClientRouteLinkClick } from '../../stores/router'
import { getLogger } from '../../utils/logger'

const log = getLogger('card component')

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
  const locale = useStore(localestore)

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
      class={`shout-card ${props.settings?.additionalClass || ''}`}
      classList={{
        'shout-card--short': props.settings?.noimage,
        'shout-card--photo-bottom': props.settings?.noimage && props.settings?.photoBottom,
        'shout-card--feed': props.settings?.isFeedMode
      }}
    >
      <Show when={mainTopic}>
        <Show when={!props.settings?.noimage && cover}>
          <div class="shout-card__cover-container">
            <div class="shout-card__cover">
              <img src={cover || ''} alt={title || ''} loading="lazy" />
            </div>
          </div>
        </Show>

        <div class="shout-card__content">
          <Show
            when={layout && layout !== 'article' && !(props.settings?.noicon || props.settings?.noimage)}
          >
            <div class="shout-card__type">
              <a href={`/topic/${mainTopic.slug}`}>
                <Icon name={layout} />
              </a>
            </div>
          </Show>

          <Show when={!props.settings?.isGroup}>
            <div class="shout__topic">
              <a href={`/topic/${mainTopic.slug}`}>
                {locale() === 'ru' && mainTopic.title ? mainTopic.title : mainTopic.slug.replace('-', ' ')}
              </a>
            </div>
          </Show>

          <div class="shout-card__titles-container">
            <a href={`/${slug || ''}`} onClick={handleClientRouteLinkClick}>
              <div class="shout-card__title">
                <span class="shout-card__link-container">{title}</span>
              </div>

              <Show when={!props.settings?.nosubtitle && subtitle}>
                <div class="shout-card__subtitle">
                  <span class="shout-card__link-container">{subtitle}</span>
                </div>
              </Show>
            </a>
          </div>

          <Show when={!props.settings?.noauthor || !props.settings?.nodate}>
            <div class="shout__details">
              <Show when={!props.settings?.noauthor}>
                <div class="shout__author">
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
                <div class="shout__date">{formattedDate()}</div>
              </Show>
            </div>
          </Show>

          <Show when={props.settings?.isFeedMode}>
            <section class="shout-card__details">
              <div class="shout-card__details-content">
                <div class="shout-card__details-item rating">
                  <button class="rating__control">&minus;</button>
                  <span class="rating__value">{stat?.rating || ''}</span>
                  <button class="rating__control">+</button>
                </div>
                <div class="shout-card__details-item shout-card__comments">
                  <Icon name="eye" />
                  {stat?.viewed}
                </div>
                <div class="shout-card__details-item shout-card__comments">
                  <a href={`/${slug + '#comments' || ''}`}>
                    <Icon name="comment" />
                    {stat?.commented || ''}
                  </a>
                </div>

                <div class="shout-card__details-item">
                  <button>
                    <Icon name="bookmark" />
                  </button>
                </div>

                <div class="shout-card__details-item">
                  <button>
                    <Icon name="ellipsis" />
                  </button>
                </div>
              </div>

              <button class="button--light shout-card__edit-control">{t('Collaborate')}</button>
            </section>
          </Show>
        </div>
      </Show>
    </section>
  )
}
