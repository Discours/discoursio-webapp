import { RouteDefinition, RouteSectionProps, createAsync, useParams } from '@solidjs/router'
import { createSignal, onMount } from 'solid-js'
import { InboxView } from '~/components/Views/InboxView'
import { PageLayout } from '~/components/_shared/PageLayout'
import { ShowOnlyOnClient } from '~/components/_shared/ShowOnlyOnClient'
import { useInbox } from '~/context/inbox'
import { useLocalize } from '~/context/localize'
import { useSession } from '~/context/session'
import { loadAuthorsAll } from '~/graphql/api/public'
import { Chat } from '~/graphql/schema/chat.gen'
import { Author } from '~/graphql/schema/core.gen'

export const route = {
  load: async () => {
    const authorsAllFetcher = loadAuthorsAll()
    return {
      authors: await authorsAllFetcher()
    }
  }
} satisfies RouteDefinition

export const ChatPage = (props: RouteSectionProps<{ authors: Author[] }>) => {
  const { t } = useLocalize()
  const params = useParams()
  const { createChat, chats } = useInbox()
  const [chat, setChat] = createSignal<Chat>()
  const { session } = useSession()
  const authors = createAsync(async () => {
    const authorsAllFetcher = loadAuthorsAll()
    return props.data.authors || (await authorsAllFetcher())
  })

  onMount(async () => {
    if (params.id.includes('-')) {
      // real chat id contains -
      setChat((_) => chats().find((x: Chat) => x.id === params.id))
    } else {
      try {
        // handle if params.id is an author's id
        const me = session()?.user?.app_data?.profile.id as number
        const author = Number.parseInt(params.chat)
        const result = await createChat([author, me], '')
        // result.chat.id && redirect(`/inbox/${result.chat.id}`)
        result.chat && setChat(result.chat)
      } catch (e) {
        console.warn(e)
      }
    }
  })
  return (
    <PageLayout hideFooter={true} title={t('Inbox')}>
      <ShowOnlyOnClient>
        <InboxView authors={authors() || []} chat={chat() as Chat} />
      </ShowOnlyOnClient>
    </PageLayout>
  )
}
