import { clsx } from 'clsx'
import styles from './InfiniteScroll.module.scss'

type Props = {
  class?: string
}

export const InfiniteScroll = (props: Props) => {
  return <div class={clsx(styles.InfiniteScroll, props.class)}>InfiniteScroll</div>
}
