import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'
import styles from './Topics.module.scss'
import { clsx } from 'clsx'
import { router, useRouter } from '../../../stores/router'
import { getPagePath } from '@nanostores/router'

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
          <a href="/podcasts">Подкасты</a>
        </li>
        <li class={styles.item}>
          <a href="">Спецпроекты</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/interview">#Интервью</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/reportage">#Репортажи</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/empiric">#Личный опыт</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/society">#Общество</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/culture">#Культура</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/theory">#Теории</a>
        </li>
        <li class={styles.item}>
          <a href="/topic/poetry">#Поэзия</a>
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
