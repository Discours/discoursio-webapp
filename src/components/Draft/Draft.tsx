import type { Shout } from '../../graphql/schema/core.gen'

import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'

import { useConfirm } from '../../context/confirm'
import { useLocalize } from '../../context/localize'
import { useSnackbar } from '../../context/snackbar'
import { router } from '../../stores/router'
import { Icon } from '../_shared/Icon'

import styles from './Draft.module.scss'

type Props = {
  class?: string
  shout: Shout
  onPublish: (shout: Shout) => void
  onDelete: (shout: Shout) => void
}

export const Draft = (props: Props) => {
  const { t, formatDate } = useLocalize()
  const { showConfirm } = useConfirm()
  const { showSnackbar } = useSnackbar()

  const handlePublishLinkClick = (e) => {
    e.preventDefault()
    if (props.shout.main_topic) {
      props.onPublish(props.shout)
    } else {
      showSnackbar({ body: t('Please, set the main topic first') })
    }
  }

  const handleDeleteLinkClick = async (e) => {
    e.preventDefault()

    const isConfirmed = await showConfirm({
      confirmBody: t('Are you sure you want to delete this draft?'),
      confirmButtonLabel: t('Delete'),
      confirmButtonVariant: 'danger',
      declineButtonVariant: 'primary'
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
        {formatDate(new Date(props.shout.created_at * 1000), { hour: '2-digit', minute: '2-digit' })}
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
