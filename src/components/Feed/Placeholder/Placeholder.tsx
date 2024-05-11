import { clsx } from 'clsx'
import { For, Show } from 'solid-js'

import { useLocalize } from '../../../context/localize'
import { useSession } from '../../../context/session'
import { Icon } from '../../_shared/Icon'
import styles from './Placeholder.module.scss'

export type PlaceholderProps = {
  type: string
  mode: 'feed' | 'profile'
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
      href: '/authors?by=followers',
    },
    feedCollaborations: {
      image: 'placeholder-experts.webp',
      header: t('Find collaborators'),
      text: t('Placeholder feedCollaborations'),
      buttonLabel: t('Find co-authors'),
      href: '/authors?by=name',
    },
    feedDiscussions: {
      image: 'placeholder-discussions.webp',
      header: t('Participate in discussions'),
      text: t('Placeholder feedDiscussions'),
      buttonLabel: author() ? t('Current discussions') : t('Enter'),
      href: '/feed?by=last_comment',
    },
    author: {
      image: 'placeholder-join.webp',
      header: t('Join our team of authors'),
      text: t('Join our team of authors text'),
      buttonLabel: t('Create post'),
      href: '/create',
      profileLinks: [
        {
          href: '/how-to-write-a-good-article',
          label: t('How to write a good article'),
        },
      ],
    },
    authorComments: {
      image: 'placeholder-discussions.webp',
      header: t('Join discussions'),
      text: t('Placeholder feedDiscussions'),
      buttonLabel: t('Go to discussions'),
      href: '/feed?by=last_comment',
      profileLinks: [
        {
          href: '/about/discussion-rules',
          label: t('Discussion rules'),
        },
        {
          href: '/about/discussion-rules#ban',
          label: t('Block rules'),
        },
      ],
    },
  }

  return (
    <div
      class={clsx(
        styles.placeholder,
        styles[`placeholder--${props.type}`],
        styles[`placeholder--${props.mode}-mode`],
      )}
    >
      <div class={styles.placeholderCover}>
        <img src={`/public/${data[props.type].image}`} />
      </div>
      <div class={styles.placeholderContent}>
        <div>
          <h3 innerHTML={data[props.type].header} />
          <p innerHTML={data[props.type].text} />
        </div>

        <Show when={data[props.type].profileLinks}>
          <div class={styles.bottomLinks}>
            <For each={data[props.type].profileLinks}>
              {(link) => (
                <a href={link.href}>
                  <Icon name="link-white" class={styles.icon} />
                  {link.label}
                </a>
              )}
            </For>
          </div>
        </Show>

        <Show
          when={author()}
          fallback={
            <a class={styles.button} href="?m=auth&mode=login">
              {data[props.type].buttonLabel}
            </a>
          }
        >
          <a class={styles.button} href={data[props.type].href}>
            {data[props.type].buttonLabel}
            <Show when={props.mode === 'profile'}>
              <Icon name="arrow-right-2" class={styles.icon} />
            </Show>
          </a>
        </Show>
      </div>
    </div>
  )
}
