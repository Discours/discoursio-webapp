import type { Reaction } from '../../../graphql/types.gen'
import { Author, ReactionKind } from '../../../graphql/types.gen'
import { For, Show } from 'solid-js'
import Userpic from '../../Author/Userpic'
import styles from './VotersList.module.scss'
import { clsx } from 'clsx'

type Props = {
  reactions: Reaction[]
  fallbackMessage: string
}

const VotersList = (props: Props) => {
  return (
    <div class={styles.VotersList}>
      <ul class={clsx('nodash', styles.users)}>
        <Show
          when={props.reactions.length > 0}
          fallback={
            <li class={styles.item}>
              <small>{props.fallbackMessage}</small>
            </li>
          }
        >
          <For each={props.reactions}>
            {(reaction) => (
              <li class={styles.item}>
                <div class={styles.user}>
                  <Userpic user={reaction.createdBy as Author} isBig={false} isAuthorsList={false} />
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

export default VotersList
