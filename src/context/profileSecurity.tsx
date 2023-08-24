import { createEffect, createMemo, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { useSession } from './session'
import { loadAuthor, useAuthorsStore } from '../stores/zine/authors'
import { apiClient } from '../utils/apiClient'
import type { ProfileSecurityInput } from '../graphql/types.gen'

const useProfileSecurityForm = () => {
  const { session } = useSession()
  const currentSlug = createMemo(() => session()?.user?.slug)
  const { authorEntities } = useAuthorsStore({ authors: [] })
  const currentAuthor = createMemo(() => authorEntities()[currentSlug()])
  const [slugError, setSlugError] = createSignal<string>()

  const submit = async (profile: ProfileSecurityInput) => {
    const response = await apiClient.updateProfileSecurity(profile)
    if (response.error) {
      setSlugError(response.error)
      return response.error
    }
    return response
  }

  const [form, setForm] = createStore<ProfileSecurityInput>({
    email: '',
    old_password: '',
    new_password: ''
  })

  createEffect(async () => {
    if (!currentSlug()) return
    try {
      await loadAuthor({ slug: currentSlug() })

      setForm({
        email: currentAuthor()?.old_password,
        old_password: currentAuthor()?.old_password,
        new_password: currentAuthor()?.new_password
      })
    } catch (error) {
      console.error(error)
    }
  })

  const updateFormField = (fieldName: string, value: string) => {
    setForm({
      [fieldName]: value
    })
  }
  return { form, submit, updateFormField, slugError }
}

export { useProfileSecurityForm }
