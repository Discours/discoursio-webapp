import { clsx } from 'clsx'
import { createSignal, For, Show } from 'solid-js'

import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'

import styles from './DropdownSelect.module.scss'

type FilterItem = {
  title: string
  description?: string
}

type Props = {
  class?: string
  selectItems: FilterItem[]
}

export const DropdownSelect = (props: Props) => {
  const [selected, setSelected] = createSignal<FilterItem>(props.selectItems[0])
  const [ddVisible, setDdVisible] = createSignal(false)

  const containerRef: { current: HTMLElement } = {
    current: null,
  }

  const handleShowDropdown = () => {
    setDdVisible(!ddVisible())
  }

  useOutsideClickHandler({
    containerRef,
    predicate: () => ddVisible(),
    handler: () => setDdVisible(false),
  })

  return (
    <div class={clsx(styles.DropdownSelect, props.class)}>
      <div class={clsx(styles.toggler, { [styles.isOpen]: ddVisible() })} onClick={handleShowDropdown}>
        <div>{selected().title}</div>
      </div>

      <Show when={ddVisible()}>
        <ul class={styles.listItems} ref={(el) => (containerRef.current = el)}>
          <For each={props.selectItems}>
            {(item) => (
              <li>
                <h3 class={styles.title}>{item.title}</h3>
                <Show when={item.description}>
                  <p class={styles.description}>{item.description}</p>
                </Show>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
