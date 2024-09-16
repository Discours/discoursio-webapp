import { Meta, Title } from '@solidjs/meta'
import { useLocation } from '@solidjs/router'
import { clsx } from 'clsx'
import type { JSX } from 'solid-js'
import { Show, createMemo } from 'solid-js'
import { useLocalize } from '~/context/localize'
import { Shout } from '~/graphql/schema/core.gen'
import enKeywords from '~/intl/locales/en/keywords.json'
import ruKeywords from '~/intl/locales/ru/keywords.json'
import { getImageUrl, getOpenGraphImageUrl } from '~/lib/getThumbUrl'
import { descFromBody } from '~/utils/meta'
import { FooterView } from '../Discours/Footer'
import { Header } from '../HeaderNav'
import styles from './PageLayout.module.scss'

type PageLayoutProps = {
  title: string
  desc?: string
  keywords?: string
  headerTitle?: string
  slug?: string
  article?: Shout
  cover?: string
  children: JSX.Element
  isHeaderFixed?: boolean
  hideFooter?: boolean
  class?: string
  withPadding?: boolean
  zeroBottomPadding?: boolean
  key?: string
}

export const PageLayout = (props: PageLayoutProps) => {
  const isHeaderFixed = props.isHeaderFixed === undefined ? true : props.isHeaderFixed // FIXME: выглядит как костылек
  const loc = useLocation()
  const { t, lang } = useLocalize()
  const imageUrl = props.cover ? getImageUrl(props.cover) : 'production/image/logo_image.png'
  const ogImage = createMemo(() =>
    // NOTE: preview generation logic works only for one article view
    props.article
      ? getOpenGraphImageUrl(imageUrl, {
          title: props.title,
          topic: props.article?.topics?.[0]?.title || '',
          author: props.article?.authors?.[0]?.name || '',
          width: 1200
        })
      : imageUrl
  )
  const description = createMemo(() => props.desc || (props.article && descFromBody(props.article.body)))
  const keywords = createMemo(() => {
    const keypath = (props.key || loc?.pathname.split('/')[0]) as keyof typeof ruKeywords
    return props.keywords || lang() === 'ru' ? ruKeywords[keypath] : enKeywords[keypath]
  })
  return (
    <>
      <Title>{props.article?.title || t(props.title)}</Title>
      <Header
        slug={props.slug}
        title={props.headerTitle}
        desc={props.desc}
        cover={imageUrl}
        isHeaderFixed={isHeaderFixed}
      />
      <Meta name="descprition" content={description() || ''} />
      <Meta name="keywords" content={keywords()} />
      <Meta name="og:type" content="article" />
      <Meta name="og:title" content={props.article?.title || t(props.title) || ''} />
      <Meta name="og:image" content={ogImage() || ''} />
      <Meta name="twitter:image" content={ogImage() || ''} />
      <Meta name="og:description" content={description() || ''} />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={props.article?.title || t(props.title) || ''} />
      <Meta name="twitter:description" content={description() || ''} />
      <main
        class={clsx('main-content', {
          [styles.withPadding]: props.withPadding,
          [styles.zeroBottomPadding]: props.zeroBottomPadding
        })}
        classList={{ 'main-content--no-padding': !isHeaderFixed }}
      >
        {props.children}
      </main>
      <Show when={props.hideFooter !== true}>
        <FooterView />
      </Show>
    </>
  )
}
