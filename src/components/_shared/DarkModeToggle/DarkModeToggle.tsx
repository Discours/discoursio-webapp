import { clsx } from 'clsx'
import { createSignal, onCleanup, onMount } from 'solid-js'

import { useLocalize } from '~/context/localize'
import { Icon } from '../Icon'

import styles from './DarkModeToggle.module.scss'

type Props = {
  class?: string
}

export const DarkModeToggle = (props: Props) => {
  const { t } = useLocalize()
  const [editorDarkMode, setEditorDarkMode] = createSignal(false)

  onMount(() => {
    const editorDarkModeSelected = localStorage?.getItem('editorDarkMode')
    const editorDarkModeAttr = document.documentElement.getAttribute('editorDarkMode')
    if (editorDarkModeSelected === 'true') {
      setEditorDarkMode(true)
      document.documentElement.dataset.editorDarkMode = 'true'
    } else if (editorDarkModeSelected === 'false') {
      setEditorDarkMode(false)
      document.documentElement.dataset.editorDarkMode = 'false'
    }

    if (!(editorDarkModeAttr || editorDarkModeSelected)) {
      localStorage?.setItem('editorDarkMode', 'false')
      document.documentElement.dataset.editorDarkMode = 'false'
    }

    onCleanup(() => {
      setEditorDarkMode(false)
      document.documentElement.dataset.editorDarkMode = undefined
    })
  })

  const handleSwitchTheme = () => {
    setEditorDarkMode(!editorDarkMode())
    localStorage?.setItem('editorDarkMode', editorDarkMode() ? 'true' : 'false')
    document.documentElement.dataset.editorDarkMode = editorDarkMode() ? 'true' : 'false'
  }

  return (
    <div class={clsx(styles.DarkModeToggle, props.class)}>
      <input
        type="checkbox"
        id="theme-switcher"
        value="1"
        checked={editorDarkMode()}
        onClick={handleSwitchTheme}
      />
      <label for="theme-switcher">
        {t('Night mode')}
        <div class={styles.switcher}>
          <Icon name="night-theme" class={styles.icon} />
        </div>
      </label>
    </div>
  )
}
