import { clsx } from 'clsx'
import styles from './DarkModeToggle.module.scss'
import { Icon } from '../Icon'
import { useLocalize } from '../../../context/localize'
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { createPrefersDark } from '@solid-primitives/media'

type Props = {
  class?: string
}

const editorDarkModeSelected = localStorage.getItem('editorDarkMode')
const editorDarkModeAttr = document.documentElement.getAttribute('editorDarkMode')

export const DarkModeToggle = (props: Props) => {
  const { t } = useLocalize()
  const prefersDark = createPrefersDark()
  const [editorDarkMode, setEditorDarkMode] = createSignal(false)

  onMount(() => {
    if (editorDarkModeSelected === 'true') {
      setEditorDarkMode(true)
      document.documentElement.dataset.editorDarkMode = 'true'
    } else if (editorDarkModeSelected === 'false') {
      setEditorDarkMode(false)
      document.documentElement.dataset.editorDarkMode = 'false'
    }

    if (!editorDarkModeAttr && !editorDarkModeSelected) {
      setEditorDarkMode(prefersDark())
      localStorage.setItem('editorDarkMode', prefersDark() ? 'true' : 'false')
      document.documentElement.dataset.editorDarkMode = prefersDark() ? 'true' : 'false'
    }

    onCleanup(() => {
      setEditorDarkMode(false)
      delete document.documentElement.dataset.editorDarkMode
    })
  })

  const handleSwitchTheme = () => {
    setEditorDarkMode(!editorDarkMode())
    localStorage.setItem('editorDarkMode', editorDarkMode() ? 'true' : 'false')
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
