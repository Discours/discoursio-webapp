import { useNavigate } from '@solidjs/router'
import { clsx } from 'clsx'
import { For, Show, createMemo, createSignal } from 'solid-js'
import { Draft } from '~/components/Draft'
import { Loading } from '~/components/_shared/Loading'
import { useEditorContext } from '~/context/editor'
import { useSession } from '~/context/session'
import { Shout } from '~/graphql/schema/core.gen'
import styles from './DraftsView.module.scss'

export const DraftsView = (props: { drafts: Shout[] }) => {
  const [drafts, setDrafts] = createSignal<Shout[]>(props.drafts || [])
  const { session } = useSession()
  const authorized = createMemo<boolean>(() => Boolean(session()?.access_token))
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

  return (
    <div class={clsx(styles.DraftsView)}>
      <Show when={authorized()} fallback={<Loading />}>
        <div class="wide-container">
          <div class="row">
            <div class="col-md-19 col-lg-18 col-xl-16 offset-md-5">
              <For each={drafts()}>
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
        </div>
      </Show>
    </div>
  )
}
