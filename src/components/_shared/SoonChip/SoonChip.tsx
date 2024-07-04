import { clsx } from 'clsx'

import { useLocalize } from '~/context/localize'
import { Icon } from '../Icon'

import styles from './SoonChip.module.scss'

type Props = {
  class?: string
}

export const SoonChip = (props: Props) => {
  const { t } = useLocalize()
  return (
    <div class={clsx(styles.SoonChip, props.class)}>
      <Icon name="lightning" class={styles.icon} />
      {t('Soon')}
    </div>
  )
}
