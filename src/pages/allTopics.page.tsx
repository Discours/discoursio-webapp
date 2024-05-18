import { AllTopics } from '../components/Views/AllTopics'
import { PageLayout } from '../components/_shared/PageLayout'
import { useLocalize } from '../context/localize'
import { useTopics } from '../context/topics'

export const AllTopicsPage = () => {
  const { t } = useLocalize()
  const { sortedTopics } = useTopics()

  return (
    <PageLayout title={t('Themes and plots')}>
      <AllTopics isLoaded={!!sortedTopics()?.length} topics={sortedTopics()} />
    </PageLayout>
  )
}

export const Page = AllTopicsPage
