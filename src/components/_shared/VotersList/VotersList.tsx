import { clsx } from 'clsx'
import { For, Show } from 'solid-js'

import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { Reaction, ReactionKind } from '~/graphql/schema/core.gen'
import { Userpic } from '../../Author/Userpic'

import { A } from '@solidjs/router'
import styles from './VotersList.module.scss'

export type VotersListProps = {
  reactions: Reaction[]
}

export const RATINGS_PER_PAGE = 10

export const VotersList = (props: VotersListProps) => {
  const { t } = useLocalize()
  const { session } = useSession()
  return (
    <div class={styles.VotersList}>
      <ul class={clsx('nodash', styles.users)}>
        <Show
          when={props.reactions.length > 0}
          fallback={
            <li class={clsx(styles.item, styles.fallbackMessage)}>
              <Show when={!session()?.access_token} fallback={t('No one rated yet')}>
                <A href="?m=auth&mode=login">{t('Sign in')}</A>
                {`, ${t('to see who rated')}`}
              </Show>
            </li>
          }
        >
          <For each={props.reactions}>
            {(reaction) => (
              <li class={styles.item}>
                <div class={styles.user}>
                  <Userpic
                    name={reaction.created_by.name || ''}
                    userpic={reaction.created_by.pic || ''}
                    class={styles.userpic}
                  />
                  <a href={`/@${reaction.created_by.slug}`}>{reaction.created_by.name || ''}</a>
                </div>
                {reaction.kind === ReactionKind.Like ? (
                  <div class={styles.commentRatingPositive}>+1</div>
                ) : (
                  <div class={styles.commentRatingNegative}>&minus;1</div>
                )}
              </li>
            )}
          </For>
        </Show>
      </ul>
    </div>
  )
}
