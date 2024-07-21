import { clsx } from 'clsx'
import { createSignal, onCleanup, onMount } from 'solid-js'

import { useLocalize } from '~/context/localize'

import styles from './TimeAgo.module.scss'

type Props = {
  date: string | number | Date
  class?: string
}

export const TimeAgo = (props: Props) => {
  const { formatDate, formatTimeAgo } = useLocalize()
  const [formattedTimeAgo, setFormattedTimeAgo] = createSignal(formatTimeAgo(new Date(props.date)))

  onMount(() => {
    let timerId: NodeJS.Timeout
    const updateTimeAgo = () => {
      timerId = setTimeout(() => {
        setFormattedTimeAgo(formatTimeAgo(new Date(props.date)))
        updateTimeAgo()
      }, 1000)
    }
    updateTimeAgo()

    onCleanup(() => clearTimeout(timerId))
  })

  return (
    <div
      class={clsx(styles.TimeAgo, props.class)}
      title={formatDate(new Date(props.date), { month: '2-digit', hour: '2-digit', minute: '2-digit' })}
    >
      {formattedTimeAgo()}
    </div>
  )
}
