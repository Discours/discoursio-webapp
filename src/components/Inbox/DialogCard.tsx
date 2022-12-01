import { Show, Switch, Match, createMemo, For } from 'solid-js'
import DialogAvatar from './DialogAvatar'
import type { ChatMember } from '../../graphql/types.gen'
import GroupDialogAvatar from './GroupDialogAvatar'
import { clsx } from 'clsx'
import styles from './DialogCard.module.scss'

type DialogProps = {
  online?: boolean
  message?: string
  counter?: number
  title?: string
  ownSlug: string
  members: ChatMember[]
  onClick?: () => void
  isChatHeader?: boolean
}

const DialogCard = (props: DialogProps) => {
  const companions = createMemo(
    () => props.members && props.members.filter((member) => member.slug !== props.ownSlug)
  )
  const names = createMemo(() =>
    companions()
      .map((companion) => companion.name)
      .join(', ')
  )
  return (
    <Show when={props.members}>
      <div class={clsx(styles.DialogCard, { [styles.header]: props.isChatHeader })} onClick={props.onClick}>
        <div class={styles.avatar}>
          <Switch fallback={<DialogAvatar name={props.members[0].name} url={props.members[0].userpic} />}>
            <Match when={companions().length > 2}>
              <GroupDialogAvatar users={companions()} />
            </Match>
          </Switch>
        </div>
        <div class={styles.row}>
          <Switch fallback={<div class={styles.name}>{companions()[0].name}</div>}>
            <Match when={companions().length > 1}>
              <div class={styles.name}>{props.title}</div>
            </Match>
          </Switch>
          <div class={styles.message}>
            <Switch fallback={'Chat last message'}>
              <Match when={props.isChatHeader && companions().length > 1}>{names}</Match>
            </Switch>
          </div>
        </div>
        <Show when={!props.isChatHeader}>
          <div class={styles.activity}>
            <div class={styles.time}>22:22</div>
            <div class={styles.counter}>
              <span>12</span>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  )
}

export default DialogCard
