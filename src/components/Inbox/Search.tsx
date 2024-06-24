import { createSignal } from 'solid-js'

import { Icon } from '../_shared/Icon'

import styles from './Search.module.scss'

type Props = {
  placeholder: string
  onChange: (value: () => string) => void
}

const Search = (props: Props) => {
  // FIXME: this component does not use value, is it used?
  const [_value, setValue] = createSignal<string>('')
  const search = (event: (InputEvent | undefined) & { target: { value: string } }) => {
    event?.preventDefault()
    const v = event?.target?.value || ''
    if (v) {
      setValue(v)
      props.onChange(() => v)
    }
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

export default Search
