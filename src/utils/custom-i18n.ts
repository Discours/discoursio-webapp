import { useRouter } from '../stores/router'
import type { AuthModalSearchParams } from '../components/Nav/AuthModal/types'
import { useLocalize } from '../context/localize'

const getTextsFromSourceRecord = (title, source) => {
  const { t } = useLocalize()

  switch (source) {
    case 'bookmark':
      return {
        title: t(`${title} to add to your bookmarks`),
        description: t(
          'In&nbsp;bookmarks, you can save favorite discussions and&nbsp;materials that you want to return to'
        )
      }
    case 'discussions':
      return {
        title: t(`${title} to participate in discussions`),
        description: t(
          "You&nbsp;ll be able to participate in&nbsp;discussions, rate others' comments and&nbsp;learn about&nbsp;new responses"
        )
      }
    case 'follow':
      return {
        title: t(`${title} to subscribe`),
        description: t(
          'This way you&nbsp;ll be able to subscribe to&nbsp;authors, interesting topics and&nbsp;customize your feed'
        )
      }
    case 'subscribe':
      return {
        title: t(`${title} to subscribe to new publications`),
        description: t(
          'This way you&nbsp;ll be able to subscribe to&nbsp;authors, interesting topics and&nbsp;customize your feed'
        )
      }
    case 'vote':
      return {
        title: t(`${title} to vote`),
        description: t(
          'This way we&nbsp;ll realize that you&nbsp;re a real person and&nbsp;ll take your vote into account. And&nbsp;you&nbsp;ll see how others voted'
        )
      }
    default:
      return {
        title: `${title}`,
        description: ''
      }
  }
}

export const generateModalTextsFromSource = (modalType: 'login' | 'register') => {
  const { searchParams } = useRouter<AuthModalSearchParams>()
  const { t } = useLocalize()

  const { source } = searchParams()

  let title = modalType === 'login' ? 'Enter the Discours' : 'Create account'

  if (source) {
    return getTextsFromSourceRecord(title, source)
  } else {
    return {
      title: t(title),
      description: ''
    }
  }
}
