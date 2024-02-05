import { getPagePath } from '@nanostores/router'
import { clsx } from 'clsx'

import { useLocalize } from '../../../context/localize'
import { router, useRouter } from '../../../stores/router'
import { Icon } from '../../_shared/Icon'

import styles from './Topics.module.scss'

export const Topics = () => {
  const { t } = useLocalize()
  const { page } = useRouter()
  return (
    <nav class={clsx('wide-container text-2xl', styles.Topics)}>
      <ul class={styles.list}>
        <li class={styles.item}>
          <a class={clsx({ [styles.selected]: page().route === 'expo' })} href="/expo">
            {t('Art')}
          </a>
        </li>
        <li class={styles.item}>
          <a href="/podcasts">{t('Podcasts')}</a>
        </li>
        <li class={styles.item}>
          <a href="/about/projects">{t('Special Projects')}</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/interview">#{t('Interview')}</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/reportage">#{t('Reports')}</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/empiric">#{t('Experience')}</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/society">#{t('Society')}</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/culture">#{t('Culture')}</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/theory">#{t('Theory')}</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/poetry">#{t('Poetry')}</a>
        </li>
        <li class={clsx(styles.item, styles.right)}>
          <a href={getPagePath(router, 'topics')}>
            <span>
              {t('All topics')}
              <Icon name="arrow-right-black" class={'icon'} />
            </span>
          </a>
        </li>
      </ul>
    </nav>
  )
}
