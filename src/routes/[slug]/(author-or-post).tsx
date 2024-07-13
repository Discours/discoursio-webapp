import { RouteDefinition, RouteSectionProps, createAsync, useLocation, useParams } from '@solidjs/router'
import { HttpStatusCode } from '@solidjs/start'
import {
  ErrorBoundary,
  Show,
  Suspense,
  createEffect,
  createMemo,
  createSignal,
  on,
  onMount
} from 'solid-js'
import { FourOuFourView } from '~/components/Views/FourOuFour'
import { Loading } from '~/components/_shared/Loading'
import { gaIdentity } from '~/config'
import { useLocalize } from '~/context/localize'
import { getAuthor, getShout } from '~/graphql/api/public'
import type { Author, Reaction, Shout } from '~/graphql/schema/core.gen'
import { initGA, loadGAScript } from '~/utils/ga'
import { descFromBody, keywordsFromTopics } from '~/utils/meta'
import { FullArticle } from '../../components/Article/FullArticle'
import { PageLayout } from '../../components/_shared/PageLayout'
import { ReactionsProvider } from '../../context/reactions'
import AuthorPage, { AuthorPageProps } from '../author/[slug]/[...tab]'

const fetchShout = async (slug: string): Promise<Shout | undefined> => {
  const shoutLoader = getShout({ slug })
  const result = await shoutLoader()
  return result
}

const fetchAuthor = async (slug: string): Promise<Author | undefined> => {
  const authorLoader = getAuthor({ slug })
  const result = await authorLoader()
  return result
}

export const route: RouteDefinition = {
  load: async ({ params }) => ({
    article: await fetchShout(params.slug)
  })
}

type SlugPageProps = { article?: Shout; comments?: Reaction[]; votes?: Reaction[]; author?: Author }

export default (props: RouteSectionProps<SlugPageProps>) => {
  const params = useParams()
  if (params.slug.startsWith('@')) return AuthorPage(props as RouteSectionProps<AuthorPageProps>)

  const loc = useLocation()
  const { t } = useLocalize()
  const [scrollToComments, setScrollToComments] = createSignal<boolean>(false)
  const article = createAsync(async () => props.data.article || (await fetchShout(params.slug)))
  const author = createAsync(async () =>
    params.slug.startsWith('@')
      ? props.data.author || (await fetchAuthor(params.slug))
      : article()?.authors?.[0]
  )
  const titleSuffix = createMemo(
    () => (article()?.title || author()?.name) ?? ` :: ${article()?.title || author()?.name || ''}`
  )

  onMount(async () => {
    if (gaIdentity && article()?.id) {
      try {
        await loadGAScript(gaIdentity)
        initGA(gaIdentity)
      } catch (error) {
        console.warn('Failed to connect Google Analytics:', error)
      }
    }
  })

  createEffect(
    on(
      article,
      (a?: Shout) => {
        if (!a?.id) return
        window?.gtag?.('event', 'page_view', {
          page_title: a.title,
          page_location: window?.location.href || '',
          page_path: loc.pathname
        })
      },
      { defer: true }
    )
  )

  return (
    <ErrorBoundary fallback={() => <HttpStatusCode code={500} />}>
      <Suspense fallback={<Loading />}>
        <Show
          when={article()?.id}
          fallback={
            <PageLayout isHeaderFixed={false} hideFooter={true} title={t('Nothing is here')}>
              <FourOuFourView />
              <HttpStatusCode code={404} />
            </PageLayout>
          }
        >
          <Show
            when={params.slug.startsWith('@')}
            fallback={
              <PageLayout
                title={`${t('Discours')}${titleSuffix() || ''}`}
                desc={keywordsFromTopics(article()?.topics as { title: string }[])}
                headerTitle={article()?.title || ''}
                slug={article()?.slug}
                cover={article()?.cover || ''}
                scrollToComments={(value) => setScrollToComments(value)}
              >
                <ReactionsProvider>
                  <FullArticle article={article() as Shout} scrollToComments={scrollToComments()} />
                </ReactionsProvider>
              </PageLayout>
            }
          >
            <PageLayout
              title={`${t('Discours')}${titleSuffix() || ''}`}
              desc={descFromBody(author()?.about || author()?.bio || '')}
              headerTitle={author()?.name || ''}
              slug={author()?.slug}
              cover={author()?.pic || ''}
            >
              <ReactionsProvider>
                <FullArticle article={article() as Shout} scrollToComments={scrollToComments()} />
              </ReactionsProvider>
            </PageLayout>
          </Show>
        </Show>
      </Suspense>
    </ErrorBoundary>
  )
}
