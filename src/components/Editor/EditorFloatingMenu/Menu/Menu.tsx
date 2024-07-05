import { useLocalize } from '~/context/localize'
import { Icon } from '../../../_shared/Icon'
import { Popover } from '../../../_shared/Popover'

import styles from './Menu.module.scss'

export type MenuItem = 'image' | 'embed' | 'horizontal-rule'

type Props = {
  selectedItem: (value: string) => void
}

export const Menu = (props: Props) => {
  const { t } = useLocalize()
  const setSelectedMenuItem = (value: MenuItem) => {
    props.selectedItem(value)
  }

  return (
    <div class={styles.Menu}>
      <Popover content={t('Add image')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button ref={triggerRef} type="button" onClick={() => setSelectedMenuItem('image')}>
            <Icon class={styles.icon} name="editor-image" />
          </button>
        )}
      </Popover>
      <Popover content={t('Add an embed widget')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button ref={triggerRef} type="button" onClick={() => setSelectedMenuItem('embed')}>
            <Icon class={styles.icon} name="editor-embed" />
          </button>
        )}
      </Popover>
      <Popover content={t('Add rule')}>
        {(triggerRef: (el: HTMLElement) => void) => (
          <button ref={triggerRef} type="button" onClick={() => setSelectedMenuItem('horizontal-rule')}>
            <Icon class={styles.icon} name="editor-horizontal-rule" />
          </button>
        )}
      </Popover>
    </div>
  )
}
