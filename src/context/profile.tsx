import type { ProfileInput } from '../graphql/types.gen'

import { createEffect, createMemo, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'

import { loadAuthor, useAuthorsStore } from '../stores/zine/authors'
import { apiClient, ApiError } from '../utils/apiClient'

import { useSession } from './session'
import { useLocalize } from './localize'

const userpicUrl = (userpic: string) => {
  if (userpic.includes('assets.discours.io')) {
    return userpic.replace('100x', '500x500')
  }
  return userpic
}
const useProfileForm = () => {
  const { t } = useLocalize()
  const { session } = useSession()
  const currentSlug = createMemo(() => session()?.user?.slug)
  const { authorEntities } = useAuthorsStore({ authors: [] })
  const currentAuthor = createMemo(() => authorEntities()[currentSlug()])
  const [slugError, setSlugError] = createSignal<string>()

  const submit = async (profile: ProfileInput) => {
    try {
      await apiClient.updateProfile(profile)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'duplicate_slug') {
          setSlugError(t('The address is already taken'))
          return
        }
        return error
      }
    }
  }

  const [form, setForm] = createStore<ProfileInput>({
    name: '',
    bio: '',
    about: '',
    slug: '',
    userpic: '',
    links: [],
  })

  createEffect(async () => {
    if (!currentSlug()) return
    try {
      await loadAuthor({ slug: currentSlug() })
      setForm({
        name: currentAuthor()?.name,
        slug: currentAuthor()?.slug,
        bio: currentAuthor()?.bio,
        about: currentAuthor()?.about,
        userpic: userpicUrl(currentAuthor()?.userpic),
        links: currentAuthor()?.links,
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
          form.links.filter((item) => item !== value),
        )
      } else {
        setForm((prev) => ({ ...prev, links: [...prev.links, value] }))
      }
    } else {
      setForm({
        [fieldName]: value,
      })
    }
  }

  return { form, submit, updateFormField, slugError }
}

export { useProfileForm }
