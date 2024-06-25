import { Meta, MetaProvider } from '@solidjs/meta'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { type JSX, Suspense } from 'solid-js'

import { Loading } from './components/_shared/Loading'
import { PageLayout } from './components/_shared/PageLayout'
import { EditorProvider } from './context/editor'
import { FeedProvider } from './context/feed'
import { GraphQLClientProvider } from './context/graphql'
import { LocalizeProvider, useLocalize } from './context/localize'
import { SessionProvider } from './context/session'
import { TopicsProvider } from './context/topics'
import { UIProvider } from './context/ui' // snackbar included
import '~/styles/app.scss'

export const Providers = (props: { children?: JSX.Element }) => {
  const { t } = useLocalize()
  return (
    <LocalizeProvider>
      <SessionProvider onStateChangeCallback={console.info}>
        <GraphQLClientProvider>
          <TopicsProvider>
            <FeedProvider>
              <MetaProvider>
                <Meta name="viewport" content="width=device-width, initial-scale=1" />
                <UIProvider>
                  <EditorProvider>
                    <Suspense fallback={<Loading />}>
                      <PageLayout title={t('Discours')}>{props.children}</PageLayout>
                    </Suspense>
                  </EditorProvider>
                </UIProvider>
              </MetaProvider>
            </FeedProvider>
          </TopicsProvider>
        </GraphQLClientProvider>
      </SessionProvider>
    </LocalizeProvider>
  )
}

export const App = () => (
  <Router root={Providers}>
    <FileRoutes />
  </Router>
)

export default App