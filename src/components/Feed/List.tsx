import { Row1 } from './Row1'
import { Row2 } from './Row2'
import { Row3 } from './Row3'
import { shuffle } from '../../utils'
import { createMemo, createSignal, For, Suspense } from 'solid-js'
import type { JSX } from 'solid-js'
import type { Shout } from '../../graphql/types.gen'
import './List.scss'
import { useLocalize } from '../../context/localize'

export const Block6 = (props: { articles: Shout[] }) => {
  const dice = createMemo(() => shuffle([Row1, Row2, Row3]))

  return (
    <>
      <For each={dice()}>{(c: (ppp: Shout[]) => JSX.Element) => c(props.articles)}</For>
    </>
  )
}

interface ArticleListProps {
  articles: Shout[]
  page: number
  size: number
}

export default (props: ArticleListProps) => {
  const { t } = useLocalize()
  const [articles, setArticles] = createSignal(
    props.articles.slice(props.page * props.size, props.size * (props.page + 1)) || []
  )
  const [loadingMore, setLoadingMore] = createSignal(false)
  // const [, { more }] = useZine()
  const handleMore = () => {
    setArticles(props.articles.slice(props.page * props.size, props.size * (props.page + 1)))
    if (props.size * (props.page + 1) > props.articles.length) {
      console.log('[article-list] load more')
      setLoadingMore(true)
      // TODO: more()
      setLoadingMore(false)
    }
  }
  const x: number = Math.floor(articles().length / 6)
  // eslint-disable-next-line unicorn/new-for-builtins
  const numbers: number[] = [...Array(x).keys()]
  return (
    <Suspense fallback={<div class="article-preview">{t('Loading')}</div>}>
      <For each={numbers}>
        {() => <Block6 articles={articles().slice(0, Math.min(6, articles().length))} />}
      </For>
      <a href={''} onClick={handleMore} classList={{ disabled: loadingMore() }}>
        {loadingMore() ? '...' : t('More')}
      </a>
    </Suspense>
  )
}
