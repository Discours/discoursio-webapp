import type { ProfileInput } from '../graphql/types.gen'

import { createContext, createEffect, createMemo, JSX, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

import { loadAuthor, useAuthorsStore } from '../stores/zine/authors'
import { apiClient } from '../utils/apiClient'

import { useSession } from './session'

type ProfileFormContextType = {
  form: ProfileInput
  actions: {
    setForm: (profile: ProfileInput) => void
    submit: (profile: ProfileInput) => Promise<void>
    updateFormField: (fieldName: string, value: string, remove?: boolean) => void
  }
}

const ProfileFormContext = createContext<ProfileFormContextType>()

export function useProfileForm() {
  return useContext(ProfileFormContext)
}

const userpicUrl = (userpic: string) => {
  if (userpic.includes('assets.discours.io')) {
    return userpic.replace('100x', '500x500')
  }
  return userpic
}
export const ProfileFormProvider = (props: { children: JSX.Element }) => {
  const { session } = useSession()
  const [form, setForm] = createStore<ProfileInput>({})

  const currentSlug = createMemo(() => session()?.user?.slug)

  const submit = async (profile: ProfileInput) => {
    try {
      await apiClient.updateProfile(profile)
    } catch (error) {
      console.error('[ProfileFormProvider]', error)
      throw error
    }
  }

  createEffect(async () => {
    if (!currentSlug()) return
    try {
      const currentAuthor = await loadAuthor({ slug: currentSlug() })
      setForm({
        name: currentAuthor.name,
        slug: currentAuthor.slug,
        bio: currentAuthor.bio,
        about: currentAuthor.about,
        userpic: userpicUrl(currentAuthor.userpic),
        links: currentAuthor.links,
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

  const value: ProfileFormContextType = {
    form,
    actions: {
      submit,
      updateFormField,
      setForm,
    },
  }

  return <ProfileFormContext.Provider value={value}>{props.children}</ProfileFormContext.Provider>
}
