import { clsx } from 'clsx'

import { useLocalize } from '../../../context/localize'
import { Loading } from '../../_shared/Loading'

import styles from './AutoSaveNotice.module.scss'

type Props = {
  active: boolean
}

export const AutoSaveNotice = (props: Props) => {
  const { t } = useLocalize()
  return (
    <div class={clsx(styles.AutoSaveNotice, { [styles.active]: props.active })}>
      <div class={styles.icon}>
        <Loading size="tiny" />
      </div>
      <div>{t('Saving...')}</div>
    </div>
  )
}
