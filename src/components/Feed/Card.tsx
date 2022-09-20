import { t } from '../../utils/intl'
import { createMemo, createSignal, onMount } from 'solid-js'
import { For, Show } from 'solid-js/web'
import type { Author, Shout, Topic } from '../../graphql/types.gen'
import { capitalize } from '../../utils'
// import { translit } from '../../utils/ru2en'
import Icon from '../Nav/Icon'
import './Card.scss'
import { locale as localestore } from '../../stores/ui'
import { useStore } from '@nanostores/solid'
import { handleClientRouteLinkClick } from '../../stores/router'

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

export const ArticleCard = (props: ArticleCardProps) => {
  const locale = useStore(localestore)

  // const article = createMemo<Shout>(() => props.article)
  // const authors = createMemo<Author[]>(() => article().authors)
  const mainTopic = createMemo<Topic>(() =>
    props.article.topics.find((articleTopic) => articleTopic.slug === props.article.mainTopic)
  )

  const formattedDate = createMemo<string>(() => {
    return new Date(props.article.createdAt)
      .toLocaleDateString(locale(), { month: 'long', day: 'numeric', year: 'numeric' })
      .replace(' г.', '')
  })

  // const detectSubtitle = () => {
  //   const a = article()
  //   setTitle(a.title || '')
  //   if (!a.subtitle) {
  //     let tt: string[] = a.title?.split('. ') || []
  //     if (tt?.length === 1) tt = a.title?.split(/{!|\?|:|;}\s/) || []
  //     if (tt && tt.length > 1) {
  //       const sep = a.title?.replace(tt[0], '').split(' ', 1)[0]
  //       setTitle(tt[0] + (!(sep === '.' || sep === ':') ? sep : ''))
  //       setSubtitle(capitalize(a.title?.replace(tt[0] + sep, ''), true))
  //     }
  //   } else {
  //     setSubtitle(a.subtitle || '')
  //   }
  // }

  // FIXME: move this to store action
  // const translateAuthors = () => {
  //   const aaa = new Set(article().authors)
  //   aaa.forEach((a) => {
  //     a.name =
  //       a.name === 'Дискурс' && locale() !== 'ru' ? 'Discours' : translit(a.name || '', locale() || 'ru')
  //   })
  //   return [...aaa]
  // }
  // createEffect(translateAuthors, [article(), locale()])
  // onMount(detectSubtitle)

  return (
    <section
      class={`shout-card ${props.settings?.additionalClass || ''}`}
      classList={{
        'shout-card--short': props.settings?.noimage,
        'shout-card--photo-bottom': props.settings?.noimage && props.settings?.photoBottom,
        'shout-card--feed': props.settings?.isFeedMode
      }}
    >
      <Show when={mainTopic()}>
        <Show when={!props.settings?.noimage && props.article.cover}>
          <div class="shout-card__cover-container">
            <div class="shout-card__cover">
              <img src={props.article.cover || ''} alt={props.article.title || ''} loading="lazy" />
            </div>
          </div>
        </Show>

        <div class="shout-card__content">
          <Show
            when={
              props.article.layout &&
              props.article.layout !== 'article' &&
              !(props.settings?.noicon || props.settings?.noimage)
            }
          >
            <div class="shout-card__type">
              <a href={`/topic/${props.article.mainTopic}`}>
                <Icon name={props.article.layout} />
              </a>
            </div>
          </Show>

          <Show when={!props.settings?.isGroup}>
            <div class="shout__topic">
              <a href={`/topic/${mainTopic().slug}`}>
                {locale() === 'ru' && mainTopic().title
                  ? mainTopic().title
                  : mainTopic().slug.replace('-', ' ')}
              </a>
            </div>
          </Show>

          <div class="shout-card__titles-container">
            <a href={`/${props.article.slug || ''}`} onClick={handleClientRouteLinkClick}>
              <div class="shout-card__title">
                <span class="shout-card__link-container">{props.article.title}</span>
              </div>

              <Show when={!props.settings?.nosubtitle && props.article.subtitle}>
                <div class="shout-card__subtitle">
                  <span class="shout-card__link-container">{props.article.subtitle}</span>
                </div>
              </Show>
            </a>
          </div>

          <Show when={!props.settings?.noauthor || !props.settings?.nodate}>
            <div class="shout__details">
              <Show when={!props.settings?.noauthor}>
                <div class="shout__author">
                  <For each={props.article.authors}>
                    {(author, index) => (
                      <>
                        <Show when={index() > 0}>, </Show>
                        <a href={`/author/${author.slug}`}>{author.name}</a>
                      </>
                    )}
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
                  <span class="rating__value">{props.article.stat?.rating || ''}</span>
                  <button class="rating__control">+</button>
                </div>
                <div class="shout-card__details-item shout-card__comments">
                  <Icon name="eye" />
                  {props.article.stat?.viewed}
                </div>
                <div class="shout-card__details-item shout-card__comments">
                  <a href={`/${props.article.slug + '#comments' || ''}`}>
                    <Icon name="comment" />
                    {props.article.stat?.commented || ''}
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
