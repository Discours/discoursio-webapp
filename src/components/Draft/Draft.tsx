import { clsx } from 'clsx'
import styles from './Draft.module.scss'
import type { Shout } from '../../graphql/types.gen'
import { Icon } from '../_shared/Icon'
import { useLocalize } from '../../context/localize'
import { useConfirm } from '../../context/confirm'
import { useSnackbar } from '../../context/snackbar'
import { getPagePath } from '@nanostores/router'
import { router } from '../../stores/router'

type Props = {
  class?: string
  shout: Shout
  onPublish: (shout: Shout) => void
  onDelete: (shout: Shout) => void
}

export const Draft = (props: Props) => {
  const { t, formatDate } = useLocalize()
  const {
    actions: { showConfirm },
  } = useConfirm()

  const {
    actions: { showSnackbar },
  } = useSnackbar()

  const handlePublishLinkClick = (e) => {
    e.preventDefault()
    props.onPublish(props.shout)
  }

  const handleDeleteLinkClick = async (e) => {
    e.preventDefault()

    const isConfirmed = await showConfirm({
      confirmBody: t('Are you sure you want to delete this draft?'),
      confirmButtonLabel: t('Delete'),
      confirmButtonVariant: 'danger',
      declineButtonVariant: 'primary',
    })
    if (isConfirmed) {
      props.onDelete(props.shout)

      await showSnackbar({ body: t('Draft successfully deleted') })
    }
  }

  return (
    <div class={clsx(props.class)}>
      <div class={styles.created}>
        <Icon name="pencil-outline" class={styles.icon} />{' '}
        {formatDate(new Date(props.shout.createdAt), { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div class={styles.titleContainer}>
        <span class={styles.title}>{props.shout.title || t('Unnamed draft')}</span> {props.shout.subtitle}
      </div>
      <div class={styles.actions}>
        <a
          class={styles.actionItem}
          href={getPagePath(router, 'edit', { shoutId: props.shout.id.toString() })}
        >
          {t('Edit')}
        </a>
        <span onClick={handlePublishLinkClick} class={clsx(styles.actionItem, styles.publish)}>
          {t('Publish')}
        </span>
        <span onClick={handleDeleteLinkClick} class={clsx(styles.actionItem, styles.delete)}>
          {t('Delete')}
        </span>
      </div>
    </div>
  )
}
