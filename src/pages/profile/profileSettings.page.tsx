import { Show } from 'solid-js'

import { Loading } from '../../components/_shared/Loading'
import { PageLayout } from '../../components/_shared/PageLayout'
import { AuthGuard } from '../../components/AuthGuard'
import { ProfileSettings } from '../../components/ProfileSettings'
import { useLocalize } from '../../context/localize'
import { ProfileFormProvider } from '../../context/profile'

export const ProfileSettingsPage = () => {
  const { t } = useLocalize()

  return (
    <PageLayout title={t('Profile')}>
      <AuthGuard>
        <ProfileFormProvider>
          <ProfileSettings />
        </ProfileFormProvider>
      </AuthGuard>
    </PageLayout>
  )
}

export const Page = ProfileSettingsPage
