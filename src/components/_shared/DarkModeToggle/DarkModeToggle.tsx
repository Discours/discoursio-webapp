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
  const [isDark, setIsDark] = createSignal(false)

  onMount(() => {
    const theme = localStorage?.getItem('theme') || document.documentElement.getAttribute('theme')
    if (theme === 'dark') {
      setIsDark(true)
      document.documentElement.dataset.theme = 'dark'
    } else if (theme !== 'dark') {
      setIsDark(false)
      document.documentElement.dataset.theme = 'light'
    }

    if (!theme) {
      localStorage?.setItem('theme', 'light')
      document.documentElement.dataset.theme = 'light'
    }

    onCleanup(() => {
      setIsDark(false)
      document.documentElement.dataset.theme = undefined
    })
  })

  const handleSwitchTheme = () => {
    setIsDark(!isDark())
    localStorage?.setItem('theme', isDark() ? 'dark' : 'light')
    document.documentElement.dataset.theme = isDark() ? 'dark' : 'light'
  }

  return (
    <div class={clsx(styles.DarkModeToggle, props.class)}>
      <input type="checkbox" id="theme-switcher" value="1" checked={isDark()} onClick={handleSwitchTheme} />
      <label for="theme-switcher">
        {t('Night mode')}
        <div class={styles.switcher}>
          <Icon name="night-theme" class={styles.icon} />
        </div>
      </label>
    </div>
  )
}
