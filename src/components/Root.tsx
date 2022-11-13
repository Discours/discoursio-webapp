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
import { AuthProvider } from '../context/auth'

// TODO: lazy load
// const HomePage = lazy(() => import('./Pages/HomePage'))
// const AllTopicsPage = lazy(() => import('./Pages/AllTopicsPage'))
// const TopicPage = lazy(() => import('./Pages/TopicPage'))
// const AllAuthorsPage = lazy(() => import('./Pages/AllAuthorsPage'))
// const AuthorPage = lazy(() => import('./Pages/AuthorPage'))
// const FeedPage = lazy(() => import('./Pages/FeedPage'))
// const ArticlePage = lazy(() => import('./Pages/ArticlePage'))
// const SearchPage = lazy(() => import('./Pages/SearchPage'))
// const FourOuFourPage = lazy(() => import('./Pages/FourOuFourPage'))
// const DogmaPage = lazy(() => import('./Pages/about/DogmaPage'))
// const GuidePage = lazy(() => import('./Pages/about/GuidePage'))
// const HelpPage = lazy(() => import('./Pages/about/HelpPage'))
// const ManifestPage = lazy(() => import('./Pages/about/ManifestPage'))
// const PartnersPage = lazy(() => import('./Pages/about/PartnersPage'))
// const ProjectsPage = lazy(() => import('./Pages/about/ProjectsPage'))
// const TermsOfUsePage = lazy(() => import('./Pages/about/TermsOfUsePage'))
// const ThanksPage = lazy(() => import('./Pages/about/ThanksPage'))
// const CreatePage = lazy(() => import('./Pages/about/CreatePage'))

const pagesMap: Record<keyof Routes, Component<PageProps>> = {
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
    <AuthProvider>
      <Dynamic component={pageComponent()} {...props} />
    </AuthProvider>
  )
}
