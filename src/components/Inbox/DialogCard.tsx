import type { ChatMember } from '../../graphql/schema/chat.gen'

import { clsx } from 'clsx'
import { Show, Switch, Match, createMemo } from 'solid-js'

import { useLocalize } from '../../context/localize'
import { Author } from '../../graphql/schema/core.gen'
import { AuthorBadge } from '../Author/AuthorBadge'

import DialogAvatar from './DialogAvatar'
import GroupDialogAvatar from './GroupDialogAvatar'

import styles from './DialogCard.module.scss'

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
    () => props.members && props.members.filter((member: ChatMember) => member.id !== props.ownId),
  )

  const names = createMemo<string>(() => (companions() || []).map((companion) => companion.name).join(', '))

  return (
    <Show when={props.members}>
      <div
        class={clsx(styles.DialogCard, {
          [styles.opened]: props.isOpened,
          [styles.hovered]: !props.isChatHeader,
        })}
        onClick={props.onClick}
      >
        <Switch
          fallback={
            <Show
              when={props.isChatHeader}
              fallback={
                <div class={styles.avatar}>
                  <DialogAvatar name={props.members[0].slug} url={props.members[0].pic} />
                </div>
              }
            >
              <AuthorBadge nameOnly={true} author={props.members[0] as Author} />
            </Show>
          }
        >
          <Match when={props.members.length >= 3}>
            <div class={styles.avatar}>
              <GroupDialogAvatar users={props.members} />
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
