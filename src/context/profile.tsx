import type { ProfileInput } from '../graphql/schema/core.gen'

import { JSX, createContext, createEffect, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

import { apiClient } from '../graphql/client/core'

import { useSession } from './session'

type ProfileFormContextType = {
  form: ProfileInput
  setForm: (profile: ProfileInput) => void
  submit: (profile: ProfileInput) => Promise<void>
  updateFormField: (fieldName: string, value: string, remove?: boolean) => void
}

const ProfileFormContext = createContext<ProfileFormContextType>()

export function useProfileForm() {
  return useContext(ProfileFormContext)
}

const userpicUrl = (userpic: string) => {
  if (userpic?.includes('assets.discours.io')) {
    return userpic.replace('100x', '500x500')
  }
  return userpic
}
export const ProfileFormProvider = (props: { children: JSX.Element }) => {
  const { author } = useSession()
  const [form, setForm] = createStore<ProfileInput>({})

  const submit = async (profile: ProfileInput) => {
    const response = await apiClient.updateAuthor(profile)
    if (response.error) {
      console.error(response.error)
      throw response.error
    }
  }

  createEffect(() => {
    if (author()) {
      const currentAuthor = author()
      setForm({
        name: currentAuthor.name,
        slug: currentAuthor.slug,
        bio: currentAuthor.bio,
        about: currentAuthor.about,
        pic: userpicUrl(currentAuthor.pic),
        links: currentAuthor.links,
      })
    }
  })

  const updateFormField = (fieldName: string, value: string, remove?: boolean) => {
    if (fieldName === 'links') {
      setForm((prev) => {
        const updatedLinks = remove ? prev.links.filter((item) => item !== value) : [...prev.links, value]
        return { ...prev, links: updatedLinks }
      })
    } else {
      setForm((prev) => ({ ...prev, [fieldName]: value }))
    }
  }

  const value: ProfileFormContextType = {
    form,
    submit,
    updateFormField,
    setForm,
  }

  return <ProfileFormContext.Provider value={value}>{props.children}</ProfileFormContext.Provider>
}
