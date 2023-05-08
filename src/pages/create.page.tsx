import { PageLayout } from '../components/_shared/PageLayout'
import { Loading } from '../components/_shared/Loading'
import { onMount } from 'solid-js'
import { apiClient } from '../utils/apiClient'
import { router } from '../stores/router'
import { redirectPage } from '@nanostores/router'

export const CreatePage = () => {
  onMount(async () => {
    const shout = await apiClient.createArticle({ article: {} })
    redirectPage(router, 'edit', { shoutId: shout.id.toString() })
  })

  return (
    <PageLayout>
      <Loading />
    </PageLayout>
  )
}

export const Page = CreatePage
