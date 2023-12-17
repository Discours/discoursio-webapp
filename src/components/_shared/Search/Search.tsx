import { clsx } from 'clsx'
import { createSignal } from 'solid-js'

import { Icon } from '../Icon'

import styles from './Search.module.scss'

type Props = {
  placeholder: string
  onChange: (value: () => string) => void
}

export const Search = (props: Props) => {
  const [value, setValue] = createSignal<string>('')
  const search = (event) => {
    event.preventDefault()
    setValue(event.target.value)
    props.onChange(value)
  }
  return (
    <div class={styles.Search}>
      <div class={styles.field}>
        <input type="text" onInput={search} placeholder={props.placeholder} />
        <Icon name="search" class={styles.icon} />
      </div>
    </div>
  )
}
