import styles from './Menu.module.scss'
import { Icon } from '../../../_shared/Icon'

export type MenuItem = 'image' | 'embed' | 'horizontal-rule'
type Props = {
  selectedItem: (value: string) => void
}

export const Menu = (props: Props) => {
  const setSelectedMenuItem = (value: MenuItem) => {
    props.selectedItem(value)
  }

  return (
    <div class={styles.Menu}>
      <button type="button" onClick={() => setSelectedMenuItem('image')}>
        <Icon class={styles.icon} name="editor-image" />
      </button>
      <button type="button" onClick={() => setSelectedMenuItem('embed')}>
        <Icon class={styles.icon} name="editor-embed" />
      </button>
      <button type="button" onClick={() => setSelectedMenuItem('horizontal-rule')}>
        <Icon class={styles.icon} name="editor-horizontal-rule" />
      </button>
    </div>
  )
}
