import { clsx } from 'clsx'
import { useLocalize } from '../../context/localize'
import { Loading } from '../_shared/Loading'
import styles from './InlineLoader.module.scss'

type Props = {
  class?: string
}

export const InlineLoader = (props: Props) => {
  const { t } = useLocalize()
  return (
    <div class={styles.InlineLoader}>
      <div class={styles.icon}>
        <Loading size="tiny" />
      </div>
      <div>{t('Loading')}</div>
    </div>
  )
}
