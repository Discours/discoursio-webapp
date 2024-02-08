import { AuthGuard } from '../../../components/AuthGuard'
import { ProfileSettings } from '../../../components/ProfileSettings'
import { PageLayout } from '../../../components/_shared/PageLayout'
import { useLocalize } from '../../../context/localize'
import { ProfileFormProvider } from '../../../context/profile'

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
