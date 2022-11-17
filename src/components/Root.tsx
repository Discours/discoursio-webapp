// FIXME: breaks on vercel, research
// import 'solid-devtools'

import { MODALS, setLocale, showModal } from '../stores/ui'
import { Component, createEffect, createMemo } from 'solid-js'
import { Routes, useRouter } from '../stores/router'
import { Dynamic, isServer } from 'solid-js/web'

import type { PageProps, RootSearchParams } from './types'

import { HomePage } from './Pages/HomePage'
import { AllTopicsPage } from './Pages/AllTopicsPage'
import { TopicPage } from './Pages/TopicPage'
import { AllAuthorsPage } from './Pages/AllAuthorsPage'
import { AuthorPage } from './Pages/AuthorPage'
import { FeedPage } from './Pages/FeedPage'
import { ArticlePage } from './Pages/ArticlePage'
import { SearchPage } from './Pages/SearchPage'
import { FourOuFourPage } from './Pages/FourOuFourPage'
import { DiscussionRulesPage } from './Pages/about/DiscussionRulesPage'
import { DogmaPage } from './Pages/about/DogmaPage'
import { GuidePage } from './Pages/about/GuidePage'
import { HelpPage } from './Pages/about/HelpPage'
import { ManifestPage } from './Pages/about/ManifestPage'
import { PartnersPage } from './Pages/about/PartnersPage'
import { PrinciplesPage } from './Pages/about/PrinciplesPage'
import { ProjectsPage } from './Pages/about/ProjectsPage'
import { TermsOfUsePage } from './Pages/about/TermsOfUsePage'
import { ThanksPage } from './Pages/about/ThanksPage'
import { CreatePage } from './Pages/CreatePage'
import { ConnectPage } from './Pages/ConnectPage'
import { InboxPage } from './Pages/InboxPage'
import { LayoutShoutsPage } from './Pages/LayoutShoutsPage'
import { SessionProvider } from '../context/session'

// TODO: lazy load
// const SomePage = lazy(() => import('./Pages/SomePage'))

const pagesMap: Record<keyof Routes, Component<PageProps>> = {
  inbox: InboxPage,
  expo: LayoutShoutsPage,
  connect: ConnectPage,
  create: CreatePage,
  home: HomePage,
  topics: AllTopicsPage,
  topic: TopicPage,
  authors: AllAuthorsPage,
  author: AuthorPage,
  feed: FeedPage,
  article: ArticlePage,
  search: SearchPage,
  discussionRules: DiscussionRulesPage,
  dogma: DogmaPage,
  guide: GuidePage,
  help: HelpPage,
  manifest: ManifestPage,
  projects: ProjectsPage,
  partners: PartnersPage,
  principles: PrinciplesPage,
  termsOfUse: TermsOfUsePage,
  thanks: ThanksPage
}

export const Root = (props: PageProps) => {
  const { page, searchParams } = useRouter<RootSearchParams>()

  createEffect(() => {
    const modal = MODALS[searchParams().modal]
    if (modal) {
      showModal(modal)
    }
  })

  const pageComponent = createMemo(() => {
    const result = pagesMap[page().route]

    if (!result || page().path === '/404') {
      return FourOuFourPage
    }

    return result
  })

  if (!isServer) {
    createEffect(() => {
      const lang = searchParams().lang || 'ru'
      console.log('[root] client locale is', lang)
      setLocale(lang)
    })
  }

  return (
    <SessionProvider>
      <Dynamic component={pageComponent()} {...props} />
    </SessionProvider>
  )
}
