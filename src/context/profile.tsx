import { createEffect, createMemo, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { useSession } from './session'
import { loadAuthor, useAuthorsStore } from '../stores/zine/authors'
import { apiClient } from '../utils/apiClient'
import type { ProfileInput } from '../graphql/types.gen'

const useProfileForm = () => {
  const { session } = useSession()
  const currentSlug = createMemo(() => session()?.user?.slug)
  const { authorEntities } = useAuthorsStore({ authors: [] })
  const currentAuthor = createMemo(() => authorEntities()[currentSlug()])
  const [slugError, setSlugError] = createSignal<string>()

  const submit = async (profile: ProfileInput) => {
    try {
      const response = await apiClient.updateProfile(profile)
      if (response.error) {
        setSlugError(response.error)
        return response.error
      }
      return response
    } catch (error) {
      console.error(error)
    }
  }

  const [form, setForm] = createStore<ProfileInput>({
    name: '',
    bio: '',
    slug: '',
    userpic: '',
    links: []
  })

  createEffect(async () => {
    if (!currentSlug()) return
    try {
      await loadAuthor({ slug: currentSlug() })
      setForm({
        name: currentAuthor()?.name,
        slug: currentAuthor()?.slug,
        bio: currentAuthor()?.bio,
        userpic: currentAuthor()?.userpic,
        links: currentAuthor()?.links
      })
    } catch (error) {
      console.error(error)
    }
  })

  const updateFormField = (fieldName: string, value: string, remove?: boolean) => {
    if (fieldName === 'links') {
      if (remove) {
        setForm(
          'links',
          form.links.filter((item) => item !== value)
        )
      } else {
        setForm((prev) => ({ ...prev, links: [...prev.links, value] }))
      }
    } else {
      setForm({
        [fieldName]: value
      })
    }
  }
  return { form, submit, updateFormField, slugError }
}

export { useProfileForm }
