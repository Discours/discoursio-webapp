import styles from './Menu.module.scss'
import { Icon } from '../../../_shared/Icon'

type Props = {
  selectedItem: (value: string) => void
}

export const Menu = (props: Props) => {
  return (
    <div class={styles.Menu}>
      <button type="button" onClick={() => props.selectedItem('image')}>
        <Icon class={styles.icon} name="editor-image" />
      </button>
      <button type="button" onClick={() => props.selectedItem('embed')}>
        <Icon class={styles.icon} name="editor-embed" />
      </button>
    </div>
  )
}
