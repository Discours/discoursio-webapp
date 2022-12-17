import { Show, createMemo } from 'solid-js'
import './DialogCard.module.scss'
import styles from './DialogAvatar.module.scss'
import { clsx } from 'clsx'

type Props = {
  name: string
  url?: string
  online?: boolean
  size?: 'small'
  bordered?: boolean
  className?: string
}

const colors = [
  '#001219',
  '#005f73',
  '#0a9396',
  '#94d2bd',
  '#ee9b00',
  '#ca6702',
  '#ae2012',
  '#9b2226',
  '#668cff',
  '#c34cfe',
  '#e699ff',
  '#6633ff'
]

const getById = (letter: string) =>
  colors[Math.abs(Number(BigInt(letter.toLowerCase().codePointAt(0) - 97) % BigInt(colors.length)))]

const DialogAvatar = (props: Props) => {
  const nameFirstLetter = props.name.slice(0, 1)
  const randomBg = createMemo(() => {
    return getById(nameFirstLetter)
  })

  return (
    <div
      class={clsx(styles.DialogAvatar, props.className, {
        [styles.online]: props.online,
        [styles.bordered]: props.bordered,
        [styles.small]: props.size === 'small'
      })}
      style={{ 'background-color': `${randomBg()}` }}
    >
      <Show when={props.url} fallback={() => <div class={styles.letter}>{nameFirstLetter}</div>}>
        <div class={styles.imageHolder} style={{ 'background-image': `url(${props.url})` }} />
      </Show>
    </div>
  )
}

export default DialogAvatar
