import { useRouter } from '../stores/router'
import type { AuthModalSearchParams } from '../components/Nav/AuthModal/types'
import { useLocalize } from '../context/localize'

export const generateModalTitleFromSource = (modalType: 'login' | 'register') => {
  const { searchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()

  const { source } = searchParams()

  let title = modalType === 'login' ? 'Enter the Discours' : 'Create account'

  if (source) title = `${title} from ${source}`

  return t(title)
}
