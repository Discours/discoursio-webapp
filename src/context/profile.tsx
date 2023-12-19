import type { ProfileInput } from '../graphql/schema/core.gen'

import { createContext, createEffect, createMemo, JSX, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'
import { loadAuthor } from '../stores/zine/authors'

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
  if (userpic && userpic.includes('assets.discours.io')) {
    return userpic.replace('100x', '500x500')
  }
  return userpic
}
export const ProfileFormProvider = (props: { children: JSX.Element }) => {
  const {
    author,
    actions: { getToken },
  } = useSession()
  const [form, setForm] = createStore<ProfileInput>({})

  const currentSlug = createMemo(() => author()?.slug)

  const submit = async (profile: ProfileInput) => {
    const response = await apiClient.updateProfile(profile)
    if (response.error) {
      console.error(response.error)
      throw response.error
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
        pic: userpicUrl(currentAuthor.pic),
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
