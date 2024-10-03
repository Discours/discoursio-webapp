import type { Author, ProfileInput } from '~/graphql/schema/core.gen'

import { AuthToken } from '@authorizerdev/authorizer-js'
import { Accessor, JSX, createContext, createEffect, createSignal, on, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'
import updateAuthorMuatation from '~/graphql/mutation/core/author-update'
import { useAuthors } from './authors'
import { useSession } from './session'

type ProfileContextType = {
  author: Accessor<Author>
  setAuthor: (a: Author) => void
  form: ProfileInput
  setForm: (profile: ProfileInput) => void
  submit: (profile: ProfileInput) => Promise<void>
  updateFormField: (fieldName: string, value: string, remove?: boolean) => void
}

const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType)

export function useProfile() {
  return useContext(ProfileContext)
}

const userpicUrl = (userpic: string) => {
  if (userpic?.includes('assets.discours.io')) {
    return userpic.replace('100x', '500x500')
  }
  return userpic
}

export const ProfileProvider = (props: { children: JSX.Element }) => {
  const { session, client } = useSession()
  const { addAuthor } = useAuthors()
  const [form, setForm] = createStore<ProfileInput>({} as ProfileInput)
  const [author, setAuthor] = createSignal<Author>({} as Author)

  // when session is loaded
  createEffect(
    on(
      () => session(),
      (s: AuthToken | undefined) => {
        if (s) {
          const profile = s?.user?.app_data?.profile
          if (profile?.id) {
            setAuthor(profile)
            addAuthor(profile)
          }
        }
      },
      { defer: true }
    )
  )

  const submit = async (profile: ProfileInput) => {
    const response = await client()?.mutation(updateAuthorMuatation, profile).toPromise()
    if (response?.error) {
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
        pic: userpicUrl(currentAuthor.pic || ''),
        links: currentAuthor.links
      })
    }
  })

  // TODO: validation error for `!` and `@`

  const updateFormField = (fieldName: string, value: string, remove?: boolean) => {
    let val = value
    if (fieldName === 'slug' && value.startsWith('@')) val = value.substring(1)
    if (fieldName === 'slug' && value.startsWith('!')) val = value.substring(1)
    if (fieldName === 'links') {
      setForm((prev) => {
        const updatedLinks = remove
          ? (prev.links || []).filter((item) => item !== val)
          : [...(prev.links || []), val]
        return { ...prev, links: updatedLinks }
      })
    } else {
      setForm((prev) => ({ ...prev, [fieldName]: val }))
    }
  }

  const value: ProfileContextType = {
    author,
    setAuthor,
    form,
    submit,
    updateFormField,
    setForm
  }

  return <ProfileContext.Provider value={value}>{props.children}</ProfileContext.Provider>
}
