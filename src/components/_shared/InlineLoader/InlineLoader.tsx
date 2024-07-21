import { useLocalize } from '~/context/localize'
import { Loading } from '../Loading'
import styles from './InlineLoader.module.scss'

type Props = {
  class?: string
}

export const InlineLoader = (_props: Props) => {
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
