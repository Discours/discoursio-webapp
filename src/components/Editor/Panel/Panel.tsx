import { Show } from 'solid-js'
import { clsx } from 'clsx'
import { Button } from '../../_shared/Button'
import { Icon } from '../../_shared/Icon'
import { useLocalize } from '../../../context/localize'
import styles from './Panel.module.scss'
import { useEditorContext } from '../../../context/editor'

type Props = {
  // isVisible: boolean
}

export const Panel = (props: Props) => {
  const { t } = useLocalize()
  const {
    isEditorPanelVisible,
    wordCounter,
    actions: { toggleEditorPanel }
  } = useEditorContext()

  return (
    <aside class={clsx('col-md-6', styles.Panel, { [styles.hidden]: !isEditorPanelVisible() })}>
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
          <Button value={t('Publish')} variant={'inline'} class={styles.button} />
          <Button value={t('Save draft')} variant={'inline'} class={styles.button} />
        </section>

        <section>
          <Button
            value={
              <>
                <Icon name="eye" class={styles.icon} />
                {t('Preview')}
              </>
            }
            variant={'inline'}
            class={clsx(styles.button, styles.buttonWithIcon)}
          />
          <Button
            value={
              <>
                <Icon name="pencil-outline" class={styles.icon} />
                {t('Editing')}
              </>
            }
            variant={'inline'}
            class={clsx(styles.button, styles.buttonWithIcon)}
          />
          <Button
            value={
              <>
                <Icon name="feed-discussion" class={styles.icon} />
                {t('FAQ')}
              </>
            }
            variant={'inline'}
            class={clsx(styles.button, styles.buttonWithIcon)}
          />
        </section>

        <section>
          <Button value={t('Invite co-authors')} variant={'inline'} class={styles.button} />
          <Button value={t('Publication settings')} variant={'inline'} class={styles.button} />
          <Button value={t('Corrections history')} variant={'inline'} class={styles.button} />
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
          <Show when={wordCounter().paragraphs}>
            <div>
              {t('Paragraphs')}: <em>{wordCounter().paragraphs}</em>
            </div>
          </Show>
          <div>
            {t('Last rev.')}: <em>22.03.22 в 18:20</em>
          </div>
        </div>
      </div>
    </aside>
  )
}
