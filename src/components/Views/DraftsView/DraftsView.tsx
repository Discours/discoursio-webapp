import { useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createSignal } from 'solid-js'
import { Draft } from '~/components/Draft'
import { useEditorContext } from '~/context/editor'
import { useLocalize } from '~/context/localize'
import { Shout } from '~/graphql/schema/core.gen'
import styles from './DraftsView.module.scss'

export const DraftsView = (props: { drafts: Shout[] }) => {
  const [drafts, setDrafts] = createSignal<Shout[]>(props.drafts || [])
  const navigate = useNavigate()
  const { publishShoutById, deleteShout } = useEditorContext()
  const handleDraftDelete = async (shout: Shout) => {
    const success = await deleteShout(shout.id)
    if (success) {
      setDrafts((ddd) => ddd.filter((d) => d.id !== shout.id))
    }
  }

  const handleDraftPublish = (shout: Shout) => {
    publishShoutById(shout.id)
    setTimeout(() => navigate('/feed'), 2000)
  }

  const { t } = useLocalize()

  return (
    <div class={clsx(styles.DraftsView)}>
      <div class="wide-container">
        <div class="row offset-md-5">
          <h2>{t('Drafts')}</h2>
        </div>
        <Show when={drafts()} fallback={t('No drafts')}>
          {(ddd) => (
            <div class="row">
              <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
                <For each={ddd()}>
                  {(draft) => (
                    <Draft
                      class={styles.draft}
                      shout={draft}
                      onDelete={handleDraftDelete}
                      onPublish={handleDraftPublish}
                    />
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}
