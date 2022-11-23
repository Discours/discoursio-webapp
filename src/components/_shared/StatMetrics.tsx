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
  // topics: 'topics'  # amount of topics for community💥
  followed: 'followers',
  followers: 'followers',
  reacted: 'involvings',
  reactions: 'involvings',
  commented: 'discoussions',
  comments: 'discussions',
  shouts: 'posts',
  authors: 'authors'
}

export const StatMetrics = (props: StatMetricsProps) => {
  return (
    <div class={styles.statMetrics}>
      <For each={props.fields}>
        {(entity: string) => (
          <span class={styles.statMetricsItem} classList={{ compact: props.compact }}>
            {props.stat[entity] +
              ' ' +
              t((pseudonames[entity] || entity).slice(-1)) +
              plural(props.stat[entity] || 0, locale() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's'])}
          </span>
        )}
      </For>
    </div>
  )
}
