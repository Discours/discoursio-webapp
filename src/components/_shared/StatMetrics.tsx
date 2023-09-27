import { For } from 'solid-js'
import type { Stat, TopicStat } from '../../graphql/types.gen'
import { plural } from '../../utils'
import styles from './Stat.module.scss'
import { useLocalize } from '../../context/localize'

interface StatMetricsProps {
  fields?: string[]
  stat: Stat | TopicStat
  compact?: boolean
}

const pseudonames = {
  // topics: 'topics'  # amount of topics for community💥
  followed: 'follower',
  followers: 'follower',
  rating: 'like',
  viewed: 'view',
  views: 'view',
  reacted: 'involving',
  reactions: 'involving',
  commented: 'discussion',
  comments: 'discussion',
  shouts: 'post',
  authors: 'author'
}

export const StatMetrics = (props: StatMetricsProps) => {
  const { t, lang } = useLocalize()

  return (
    <div class={styles.statMetrics}>
      <For each={props.fields}>
        {(entity: string) => (
          <span class={styles.statMetricsItem} classList={{ compact: props.compact }}>
            {props.stat[entity] +
              ' ' +
              t(pseudonames[entity] || entity.slice(-1)) +
              plural(props.stat[entity] || 0, lang() === 'ru' ? ['ов', '', 'а'] : ['s', '', 's'])}
          </span>
        )}
      </For>
    </div>
  )
}
