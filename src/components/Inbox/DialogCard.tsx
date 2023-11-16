import { Show, Switch, Match, createMemo, createEffect } from 'solid-js'
import DialogAvatar from './DialogAvatar'
import type { ChatMember } from '../../graphql/types.gen'
import GroupDialogAvatar from './GroupDialogAvatar'
import { clsx } from 'clsx'
import styles from './DialogCard.module.scss'
import { useLocalize } from '../../context/localize'
import { AuthorBadge } from '../Author/AuthorBadge'

type DialogProps = {
  online?: boolean
  message?: string
  counter?: number
  ownId: number
  members: ChatMember[]
  onClick?: () => void
  isChatHeader?: boolean
  lastUpdate?: number
  isOpened?: boolean
}

const DialogCard = (props: DialogProps) => {
  const { t, formatTime } = useLocalize()
  const companions = createMemo(
    () => props.members && props.members.filter((member) => member.id !== props.ownId)
  )

  const names = createMemo(
    () =>
      companions()
        ?.map((companion) => companion.name)
        .join(', ')
  )

  return (
    <Show when={props.members}>
      <div
        class={clsx(styles.DialogCard, {
          [styles.opened]: props.isOpened,
          [styles.hovered]: !props.isChatHeader
        })}
        onClick={props.onClick}
      >
        <Switch>
          <Match when={props.members.length === 2}>
            <div class={styles.avatar}>
              <Show
                when={props.isChatHeader}
                fallback={<DialogAvatar name={companions()[0].slug} url={companions()[0].userpic} />}
              >
                <AuthorBadge nameOnly={true} author={companions()[0]} />
              </Show>
            </div>
          </Match>
          <Match when={props.members.length >= 3}>
            <div class={styles.avatar}>
              <GroupDialogAvatar users={companions()} />
            </div>
          </Match>
        </Switch>

        <Show when={!props.isChatHeader}>
          <div class={styles.row}>
            <div class={styles.name}>
              {companions()?.length > 1 ? t('Group Chat') : companions()[0]?.name}
            </div>
            <div class={styles.message}>
              <Switch>
                <Match when={props.message}>
                  <div innerHTML={props.message} />
                </Match>
                <Match when={props.isChatHeader && companions().length > 1}>{names()}</Match>
              </Switch>
            </div>
          </div>
          <div class={styles.activity}>
            <Show when={props.lastUpdate}>
              <div class={styles.time}>{formatTime(new Date(props.lastUpdate * 1000))}</div>
            </Show>
            <Show when={props.counter > 0}>
              <div class={styles.counter}>
                <span>{props.counter}</span>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </Show>
  )
}

export default DialogCard
