import { For } from 'solid-js'
import type { Stat, TopicStat } from '../../graphql/types.gen'
import { locale } from '../../stores/ui'
import { plural } from '../../utils'
import { t } from '../../utils/intl'
import styles from './Stat.module.scss'

interface StatMetricsProps {
  fields?: string[]
  stat: Stat | TopicStat
  compact?: boolean
}

const pseudonames = {
  comments: 'discussions'
}

const nos = (s) => s.slice(0, -1)

export const StatMetrics = (props: StatMetricsProps) => {
  return (
    <div class={styles.statMetrics}>
      <For each={props.fields}>
        {(entity: string) => (
          <span class={styles.statMetricsItem} classList={{ compact: props.compact }}>
            {props.stat[entity] +
              ' ' +
              t(nos(pseudonames[entity] || entity)) +
              plural(props.stat[entity] || 0, locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's'])}
          </span>
        )}
      </For>
    </div>
  )
}
