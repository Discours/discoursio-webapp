import { clsx } from 'clsx'
import { Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import styles from './Placeholder.module.scss'

export type PlaceholderProps = {
  type: 'feed' | 'feedCollaborations' | 'feedDiscussions'
}

export const Placeholder = (props: PlaceholderProps) => {
  const { t } = useLocalize()
  const { author } = useSession()

  const data = {
    feed: {
      image: 'placeholder-feed.webp',
      header: t('Feed settings'),
      text: t('Placeholder feed'),
      buttonLabel: author() ? t('Popular authors') : t('Create own feed'),
    },
    feedCollaborations: {
      image: 'placeholder-experts.webp',
      header: t('Find collaborators'),
      text: t('Placeholder feedCollaborations'),
      buttonLabel: t('Find co-authors'),
    },
    feedDiscussions: {
      image: 'placeholder-discussions.webp',
      header: t('Participate in discussions'),
      text: t('Placeholder feedDiscussions'),
      buttonLabel: author() ? t('Current discussions') : t('Enter'),
    },
  }

  return (
    <div class={clsx(styles.placeholder, styles[`placeholder-${props.type}`])}>
      <div class={styles.placeholderCover}>
        <img src={`/public/${data[props.type].image}`} />
      </div>
      <div class={styles.placeholderContent}>
        <h3 innerHTML={data[props.type].header} />
        <p innerHTML={data[props.type].text} />

        <Show
          when={author()}
          fallback={
            <a class={styles.button} href="?m=auth&mode=login">
              {data[props.type].buttonLabel}
            </a>
          }
        >
          <button>{data[props.type].buttonLabel}</button>
        </Show>
      </div>
    </div>
  )
}
