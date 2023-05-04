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

type Props = {
  shoutSlug: string
}

export const Panel = (props: Props) => {
  const { t } = useLocalize()
  const {
    isEditorPanelVisible,
    wordCounter,
    actions: { toggleEditorPanel }
  } = useEditorContext()

  const containerRef: { current: HTMLElement } = {
    current: null
  }

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

  return (
    <aside
      ref={(el) => (containerRef.current = el)}
      class={clsx('col-md-6', styles.Panel, { [styles.hidden]: !isEditorPanelVisible() })}
    >
      <div class={styles.actionsHolder}>
        <Button
          value={<Icon name="close" />}
          variant={'inline'}
          class={styles.close}
          onClick={() => toggleEditorPanel()}
        />
      </div>
      <div class={clsx(styles.actionsHolder, styles.scrolled)}>
        <section>
          <p>
            <a>{t('Publish')}</a>
          </p>
          <p>
            <a>{t('Save draft')}</a>
          </p>
        </section>

        <section>
          <p>
            <a class={styles.linkWithIcon}>
              <Icon name="eye" class={styles.icon} />
              {t('Preview')}
            </a>
          </p>
          <p>
            <a
              class={styles.linkWithIcon}
              href={getPagePath(router, 'edit', { shoutSlug: props.shoutSlug })}
            >
              <Icon name="pencil-outline" class={styles.icon} />
              {t('Editing')}
            </a>
          </p>
          <p>
            <a class={styles.linkWithIcon}>
              <Icon name="feed-discussion" class={styles.icon} />
              {t('FAQ')}
            </a>
          </p>
        </section>

        <section>
          <p>
            <a>{t('Invite co-authors')}</a>
          </p>
          <p>
            <a href={getPagePath(router, 'editSettings', { shoutSlug: props.shoutSlug })}>
              {t('Publication settings')}
            </a>
          </p>
          <p>
            <a>{t('Corrections history')}</a>
          </p>
        </section>

        <section>
          <p>
            <a href="/how-to-write-a-good-article">{t('How to write a good article')}</a>
          </p>
          <p>
            <a href="#">{t('Hotkeys')}</a>
          </p>
          <p>
            <a href="#">{t('Help')}</a>
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
    </aside>
  )
}
