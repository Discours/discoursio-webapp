import { clsx } from 'clsx'

import { useLocalize } from '~/context/localize'

import styles from './EmptyMessage.module.scss'

export const EmptyMessage = () => {
  const { t } = useLocalize()

  return (
    <div class={clsx(styles.EmptyMessage)}>
      <div class={styles.title}>{t('No notifications yet')}</div>
      <div>{t("Write good articles, comment\nand it won't be so empty here")}</div>
    </div>
  )
}
