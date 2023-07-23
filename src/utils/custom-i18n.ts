import { useRouter } from '../stores/router'
import type { AuthModalSearchParams } from '../components/Nav/AuthModal/types'
import { useLocalize } from '../context/localize'

export const generateModalTextsFromSource = (modalType: 'login' | 'register') => {
  const { searchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()

  const { source } = searchParams()

  let title = modalType === 'login' ? 'Enter the Discours' : 'Create account'
  let description = null

  if (source) {
    title = `${title} from ${source}`
    description =
      modalType === 'login'
        ? `Enter the Discours description from ${source}`
        : `Create account description from ${source}`
  }

  return {
    title: t(title),
    description: t(description)
  }
}
