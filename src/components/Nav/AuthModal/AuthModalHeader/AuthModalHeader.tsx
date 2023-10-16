import styles from './AuthModalHeader.module.scss'
import { Show } from 'solid-js'
import { useLocalize } from '../../../../context/localize'
import { useRouter } from '../../../../stores/router'
import { AuthModalSearchParams } from '../types'

type Props = {
  modalType: 'login' | 'register'
}

export const AuthModalHeader = (props: Props) => {
  const { t } = useLocalize()
  const { searchParams } = useRouter<AuthModalSearchParams>()
  const { source } = searchParams()

  const generateModalTextsFromSource = (
    modalType: 'login' | 'register'
  ): { title: string; description: string } => {
    const title = modalType === 'login' ? 'Welcome to Discours' : 'Create account'

    switch (source) {
      case 'create': {
        return {
          title: t(`${title} to publish articles`),
          description: ''
        }
      }
      case 'bookmark': {
        return {
          title: t(`${title} to add to your bookmarks`),
          description: t(
            'In&nbsp;bookmarks, you can save favorite discussions and&nbsp;materials that you want to return to'
          )
        }
      }
      case 'discussions': {
        return {
          title: t(`${title} to participate in discussions`),
          description: t(
            "You&nbsp;ll be able to participate in&nbsp;discussions, rate others' comments and&nbsp;learn about&nbsp;new responses"
          )
        }
      }
      case 'follow': {
        return {
          title: t(`${title} to subscribe`),
          description: t(
            'This way you&nbsp;ll be able to subscribe to&nbsp;authors, interesting topics and&nbsp;customize your feed'
          )
        }
      }
      case 'subscribe': {
        return {
          title: t(`${title} to subscribe to new publications`),
          description: t(
            'This way you&nbsp;ll be able to subscribe to&nbsp;authors, interesting topics and&nbsp;customize your feed'
          )
        }
      }
      case 'vote': {
        return {
          title: t(`${title} to vote`),
          description: t(
            'This way we&nbsp;ll realize that you&nbsp;re a real person and&nbsp;ll take your vote into account. And&nbsp;you&nbsp;ll see how others voted'
          )
        }
      }
      default: {
        return {
          title: t(title),
          description: ''
        }
      }
    }
  }

  const { title, description } = generateModalTextsFromSource(props.modalType)

  return (
    <>
      <h4 class={styles.authFormHeader}>{title}</h4>
      <Show when={description}>
        <p class={styles.authFormDescription} innerHTML={description} />
      </Show>
    </>
  )
}
