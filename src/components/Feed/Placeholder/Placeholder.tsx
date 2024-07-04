import { clsx } from 'clsx'
import { For, Show, createMemo } from 'solid-js'

import { Icon } from '~/components/_shared/Icon'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import styles from './Placeholder.module.scss'

type ProfileLink = {
  href: string
  label: string
}

type PlaceholderData = {
  [key: string]: {
    image: string
    header: string
    text: string
    buttonLabel?: string
    buttonLabelAuthor?: string
    buttonLabelFeed?: string
    href: string
    profileLinks?: ProfileLink[]
  }
}

export type PlaceholderProps = {
  type: keyof PlaceholderData
  mode: 'feed' | 'profile'
}

const data: PlaceholderData = {
  feedMy: {
    image: 'placeholder-feed.webp',
    header: 'Feed settings',
    text: 'Placeholder feed',
    buttonLabelAuthor: 'Popular authors',
    buttonLabelFeed: 'Create own feed',
    href: '/author?by=followers'
  },
  feedCollaborations: {
    image: 'placeholder-experts.webp',
    header: 'Find collaborators',
    text: 'Placeholder feedCollaborations',
    buttonLabel: 'Find co-authors',
    href: '/author?by=name'
  },
  feedDiscussions: {
    image: 'placeholder-discussions.webp',
    header: 'Participate in discussions',
    text: 'Placeholder feedDiscussions',
    buttonLabelAuthor: 'Current discussions',
    buttonLabelFeed: 'Enter',
    href: '/feed?by=last_comment'
  },
  author: {
    image: 'placeholder-join.webp',
    header: 'Join our team of authors',
    text: 'Join our team of authors text',
    buttonLabel: 'Create post',
    href: '/edit/new',
    profileLinks: [
      {
        href: '/how-to-write-a-good-article',
        label: 'How to write a good article'
      }
    ]
  },
  authorComments: {
    image: 'placeholder-discussions.webp',
    header: 'Join discussions',
    text: 'Placeholder feedDiscussions',
    buttonLabel: 'Go to discussions',
    href: '/feed?by=last_comment',
    profileLinks: [
      {
        href: '/guide/debate',
        label: 'Discussion rules'
      },
      {
        href: '/guide/debate#ban',
        label: 'Block rules'
      }
    ]
  }
}

export const Placeholder = (props: PlaceholderProps) => {
  const { t } = useLocalize()
  const { session } = useSession()

  const placeholderData = createMemo(() => data[props.type])

  return (
    <div
      class={clsx(
        styles.placeholder,
        styles[`placeholder--${props.type}` as keyof typeof styles],
        styles[`placeholder--${props.mode}-mode` as keyof typeof styles]
      )}
    >
      <div class={styles.placeholderCover}>
        <img src={`/${placeholderData().image}`} alt={placeholderData().header} />
      </div>
      <div class={styles.placeholderContent}>
        <div>
          <h3 innerHTML={t(placeholderData().header)} />
          <p innerHTML={t(placeholderData().text)} />
        </div>

        <Show when={placeholderData().profileLinks}>
          <div class={styles.bottomLinks}>
            <For each={placeholderData().profileLinks}>
              {(link) => (
                <a href={link.href}>
                  <Icon name="link-white" class={styles.icon} />
                  {t(link.label)}
                </a>
              )}
            </For>
          </div>
        </Show>

        <Show
          when={session()?.access_token}
          fallback={
            <a class={styles.button} href="?m=auth&mode=login">
              {t(
                session()?.access_token
                  ? placeholderData()?.buttonLabelAuthor || ''
                  : placeholderData()?.buttonLabelFeed || ''
              )}
            </a>
          }
        >
          <a class={styles.button} href={placeholderData().href}>
            {t(
              session()?.access_token
                ? placeholderData()?.buttonLabelAuthor || ''
                : placeholderData()?.buttonLabelFeed || ''
            )}
            <Show when={props.mode === 'profile'}>
              <Icon name="arrow-right-2" class={styles.icon} />
            </Show>
          </a>
        </Show>
      </div>
    </div>
  )
}
