import { RouteDefinition, RouteSectionProps, useLocation, useParams } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import { ErrorBoundary, Show, Suspense, createEffect, onMount } from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config'
import { useLocalize } from '~/context/localize'
import { getShout } from '~/graphql/api/public'
import type { Author, Reaction, Shout, Topic } from '~/graphql/schema/core.gen'
import { initGA, loadGAScript } from '~/utils/ga'
import { descFromBody, keywordsFromTopics } from '~/utils/meta'
import { FullArticle } from '../../components/Article/FullArticle'
import { PageLayout } from '../../components/_shared/PageLayout'
import { ReactionsProvider } from '../../context/reactions'
import AuthorPage, { AuthorPageProps } from '../author/[slug]/[...tab]'
import TopicPage, { TopicPageProps } from '../topic/[slug]/[...tab]'

const fetchShout = async (slug: string): Promise<Shout | undefined> => {
  if (slug.startsWith('@')) return
  const shoutLoader = getShout({ slug })
  const result = await shoutLoader()
  return result
}

export const route: RouteDefinition = {
  load: async ({ params }) => ({
    article: await fetchShout(params.slug)
  })
}

export type ArticlePageProps = {
  article?: Shout
  comments?: Reaction[]
  votes?: Reaction[]
  author?: Author
}

export type SlugPageProps = {
  article?: Shout
  comments?: Reaction[]
  votes?: Reaction[]
  author?: Author
  topics: Topic[]
}

export default function SlugPage(props: RouteSectionProps<SlugPageProps>) {
  const params = useParams()

  if (params.slug.startsWith('@')) {
    console.debug('[routes] [slug]/[...tab] starts with @, render as author page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: params.slug.slice(1)
      }
    } as RouteSectionProps<AuthorPageProps>
    return <AuthorPage {...patchedProps} />
  }

  if (params.slug.startsWith('!')) {
    console.debug('[routes] [slug]/[...tab] starts with !, render as topic page')
    const patchedProps = {
      ...props,
      params: {
        ...props.params,
        slug: params.slug.slice(1)
      }
    } as RouteSectionProps<TopicPageProps>
    return <TopicPage {...patchedProps} />
  }

  return <ArticlePage {...props} />
}

function ArticlePage(props: RouteSectionProps<ArticlePageProps>) {
  const loc = useLocation()
  const { t } = useLocalize()
  const params = useParams()

  console.debug('Initial slug from useParams:', params.slug)

  const [data, setData] = createSignal<Shout | undefined>(undefined)

  const fetchData = async (slug: string) => {
    console.debug('Fetching article with slug (useParams):', slug)
    const result = await fetchShout(slug)
    console.debug('Fetched article data (useParams):', result)
    setData(result)
  }

  onMount(() => {
    console.debug('onMount triggered')
    fetchData(params.slug)
  })

  createEffect(() => {
    console.debug('Slug changed (useParams):', params.slug)
    fetchData(params.slug)
  })

  createEffect(() => {
    const article = data()
    if (!article?.id) return
    console.debug('Page view event for article:', article)
    window?.gtag?.('event', 'page_view', {
      page_title: article.title,
      page_location: window?.location.href || '',
      page_path: loc.pathname
    })
  })

  return (
    <ErrorBoundary fallback={() => {
      console.error('Rendering 500 error page')
      return <HttpStatusCode code={500} />
    }}>
      <Suspense fallback={<Loading />}>
        <Show
          when={data()?.id}
          fallback={
            <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
              {console.warn('Rendering 404 error page - no article data found')}
              <FourOuFourView />
              <HttpStatusCode code={404} />
            </PageLayout>
          }
        >
          {console.debug('Rendering article page with data:', data())}
          <PageLayout
            title={`${t('Discours')}${data()?.title ? ' :: ' : ''}${data()?.title || ''}`}
            desc={descFromBody(data()?.body || '')}
            keywords={keywordsFromTopics(data()?.topics as { title: string }[])}
            headerTitle={data()?.title || ''}
            slug={data()?.slug}
            cover={data()?.cover || ''}
          >
            <ReactionsProvider>
              <FullArticle article={data() as Shout} />
            </ReactionsProvider>
          </PageLayout>
        </Show>
      </Suspense>
    </ErrorBoundary>
  )
}
