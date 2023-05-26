import { clsx } from 'clsx'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'
import styles from './Panel.module.scss'
import { useEditorContext } from '../../../context/editor'
import { useOutsideClickHandler } from '../../../utils/useOutsideClickHandler'
import { useEscKeyDownHandler } from '../../../utils/useEscKeyDownHandler'
import { getPagePath } from '@nanostores/router'
import { router } from '../../../stores/router'
import { useEditorHTML } from 'solid-tiptap'
import Typograf from 'typograf'
import { createSignal } from 'solid-js'
import { DarkModeToggle } from '../../_shared/DarkModeToggle'

const typograf = new Typograf({ locale: ['ru', 'en-US'] })

type Props = {
  shoutId: number
}

export const Panel = (props: Props) => {
  const { t } = useLocalize()
  const {
    isEditorPanelVisible,
    wordCounter,
    editorRef,
    actions: { toggleEditorPanel, saveShout, publishShout }
  } = useEditorContext()

  const containerRef: { current: HTMLElement } = {
    current: null
  }

  const [isShortcutsVisible, setIsShortcutsVisible] = createSignal(false)

  useOutsideClickHandler({
    containerRef,
    predicate: () => isEditorPanelVisible(),
    handler: () => toggleEditorPanel()
  })

  useEscKeyDownHandler(() => {
    if (isEditorPanelVisible()) {
      toggleEditorPanel()
    }
  })

  const handleSaveClick = () => {
    saveShout()
  }

  const handlePublishClick = () => {
    publishShout()
  }

  const handleFixTypographyClick = () => {
    const html = useEditorHTML(() => editorRef.current())
    editorRef.current().commands.setContent(typograf.execute(html()))
  }

  return (
    <aside
      ref={(el) => (containerRef.current = el)}
      class={clsx('col-md-6', styles.Panel, { [styles.hidden]: !isEditorPanelVisible() })}
    >
      <Button
        value={<Icon name="close" />}
        variant={'inline'}
        class={styles.close}
        onClick={() => toggleEditorPanel()}
      />
      <div class={clsx(styles.actionsHolder, styles.scrolled, { hidden: isShortcutsVisible() })}>
        <section>
          <p>
            <span class={styles.link} onClick={handlePublishClick}>
              {t('Publish')}
            </span>
          </p>
          <p>
            <span class={styles.link} onClick={handleSaveClick}>
              {t('Save draft')}
            </span>
          </p>
        </section>

        <section>
          <p>
            <a class={styles.link}>{t('Invite co-authors')}</a>
          </p>
          <p>
            <a
              class={styles.link}
              onClick={() => toggleEditorPanel()}
              href={getPagePath(router, 'editSettings', { shoutId: props.shoutId.toString() })}
            >
              {t('Publication settings')}
            </a>
          </p>
          <p>
            <span class={styles.link} onClick={handleFixTypographyClick}>
              {t('Fix typography')}
            </span>
          </p>
          <p>
            <a class={styles.link}>{t('Corrections history')}</a>
          </p>
        </section>

        <section>
          <div class={styles.typograph}>
            <div>{t('Autotypograph')}</div>
            <div class={clsx(styles.typographStatus, styles.typographStatusSuccess)}>{t('Fixed')}</div>
          </div>
          <p>{t('Text checking')}</p>
        </section>

        <section>
          <DarkModeToggle />
        </section>

        <section>
          <p>
            <a class={styles.link} href="/how-to-write-a-good-article">
              {t('How to write a good article')}
            </a>
          </p>
          <p>
            <button class={styles.link} onClick={() => setIsShortcutsVisible(true)}>
              {t('Hotkeys')}
            </button>
          </p>
          <p>
            <a class={styles.link} href="#">
              {t('Help')}
            </a>
          </p>
        </section>

        <div class={styles.stats}>
          <div>
            {t('Characters')}: <em>{wordCounter().characters}</em>
          </div>
          <div>
            {t('Words')}: <em>{wordCounter().words}</em>
          </div>
          {/*<div>*/}
          {/*  {t('Last rev.')}: <em>22.03.22 в 18:20</em>*/}
          {/*</div>*/}
        </div>
      </div>

      <div class={clsx(styles.actionsHolder, styles.scrolled, { hidden: !isShortcutsVisible() })}>
        <p>
          <button class={styles.backToMenuControl} onClick={() => setIsShortcutsVisible(false)}>
            назад в меню
          </button>
        </p>

        <section class={styles.shortcutList}>
          <p>
            жирный
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>B</span>
            </span>
          </p>
          <p>
            курсив
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>I</span>
            </span>
          </p>
          <p>
            добавить ссылку
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>K</span>
            </span>
          </p>
        </section>

        <section class={styles.shortcutList}>
          <p>
            заголовок 1
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>Alt</span>
              <span class={styles.shortcutButton}>1</span>
            </span>
          </p>
          <p>
            заголовок 2
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>Alt</span>
              <span class={styles.shortcutButton}>2</span>
            </span>
          </p>
          <p>
            заголовок 3
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>Alt</span>
              <span class={styles.shortcutButton}>3</span>
            </span>
          </p>
        </section>

        <section class={styles.shortcutList}>
          <p>
            маркир. список
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>*</span>
              <span class={styles.shortcutButton}>Space</span>
            </span>
          </p>
          <p>
            нумер. список
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>1</span>
              <span class={styles.shortcutButton}>Space</span>
            </span>
          </p>
          <p>
            разделитель
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>***</span>
              <span class={styles.shortcutButton}>Enter</span>
            </span>
          </p>
        </section>

        <section class={styles.shortcutList}>
          <p>
            отменить
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>Z</span>
            </span>
          </p>
          <p>
            повторить
            <span class={styles.shortcut}>
              <span class={styles.shortcutButton}>Ctrl</span>
              <span class={styles.shortcutButton}>Shift</span>
              <span class={styles.shortcutButton}>Z</span>
            </span>
          </p>
        </section>
      </div>
    </aside>
  )
}
