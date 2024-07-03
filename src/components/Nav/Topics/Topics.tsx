import { clsx } from 'clsx'
import { useLocalize } from '../../../context/localize'
import { Icon } from '../../_shared/Icon'

import { A, useMatch } from '@solidjs/router'
import styles from './Topics.module.scss'

export const Topics = () => {
  const { t } = useLocalize()
  const matchExpo = useMatch(() => '/expo')
  return (
    <nav class={clsx('wide-container text-2xl', styles.Topics)}>
      <ul class={styles.list}>
        <li class={styles.item}>
          <A class={clsx({ [styles.selected]: matchExpo() })} href="/expo">
            {t('Art')}
          </A>
        </li>
        <li class={styles.item}>
          <A href="/podcasts">{t('Podcasts')}</A>
        </li>
        <li class={styles.item}>
          <A href="/guide/projects">{t('Special Projects')}</A>
        </li>
        <li class={styles.item}>
          <A href="/topic/interview">#{t('Interview')}</A>
        </li>
        <li class={styles.item}>
          <A href="/topic/reportage">#{t('Reports')}</A>
        </li>
        <li class={styles.item}>
          <A href="/topic/empiric">#{t('Experience')}</A>
        </li>
        <li class={styles.item}>
          <A href="/topic/society">#{t('Society')}</A>
        </li>
        <li class={styles.item}>
          <A href="/topic/culture">#{t('Culture')}</A>
        </li>
        <li class={styles.item}>
          <A href="/topic/theory">#{t('Theory')}</A>
        </li>
        <li class={styles.item}>
          <A href="/topic/poetry">#{t('Poetry')}</A>
        </li>
        <li class={clsx(styles.item, styles.right)}>
          <A href={'topics'}>
            <span>
              {t('All topics')}
              <Icon name="arrow-right-black" class={'icon'} />
            </span>
          </A>
        </li>
      </ul>
    </nav>
  )
}
