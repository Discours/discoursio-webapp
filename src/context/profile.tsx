import type { ProfileInput } from '../graphql/schema/core.gen'

import { createEffect, createMemo, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'

import { apiClient as coreClient } from '../graphql/client/core'
import { loadAuthor } from '../stores/zine/authors'

import { useSession } from './session'

const userpicUrl = (userpic: string) => {
  if (userpic.includes('assets.discours.io')) {
    return userpic.replace('100x', '500x500')
  }
  return userpic
}
const useProfileForm = () => {
  const { author: currentAuthor } = useSession()
  const [slugError, setSlugError] = createSignal<string>()

  const apiClient = createMemo(() => {
    if (!coreClient.private) coreClient.connect()
    return coreClient
  })

  const submit = async (profile: ProfileInput) => {
    const response = await apiClient().updateProfile(profile)
    if (response.error) {
      setSlugError(response.error)
      return response.error
    }
    return response
  }

  const [form, setForm] = createStore<ProfileInput>({
    name: '',
    bio: '',
    about: '',
    slug: '',
    pic: '',
    links: [],
  })

  createEffect(async () => {
    if (!currentAuthor()) return
    try {
      await loadAuthor({ slug: currentAuthor().slug })
      setForm({
        name: currentAuthor()?.name,
        slug: currentAuthor()?.slug,
        bio: currentAuthor()?.bio,
        about: currentAuthor()?.about,
        pic: userpicUrl(currentAuthor()?.pic),
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
