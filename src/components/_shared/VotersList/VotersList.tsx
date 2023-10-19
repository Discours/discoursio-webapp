import { For, Show } from 'solid-js'
import type { Reaction } from '../../../graphql/types.gen'
import { ReactionKind } from '../../../graphql/types.gen'
import { Userpic } from '../../Author/Userpic'
import styles from './VotersList.module.scss'
import { clsx } from 'clsx'

type Props = {
  reactions: Reaction[]
  fallbackMessage: string
}

export const VotersList = (props: Props) => {
  return (
    <div class={styles.VotersList}>
      <ul class={clsx('nodash', styles.users)}>
        <Show
          when={props.reactions.length > 0}
          fallback={<li class={clsx(styles.item, styles.fallbackMessage)}>{props.fallbackMessage}</li>}
        >
          <For each={props.reactions}>
            {(reaction) => (
              <li class={styles.item}>
                <div class={styles.user}>
                  <Userpic name={reaction.createdBy.name} userpic={reaction.createdBy.userpic} />
                  <a href={`/author/${reaction.createdBy.slug}`}>{reaction.createdBy.name || ''}</a>
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
