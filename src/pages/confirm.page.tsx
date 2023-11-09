import { onMount } from 'solid-js'
import { Loading } from '../components/_shared/Loading'
import Cookie from 'js-cookie'
import { setToken } from '../graphql/privateGraphQLClient'

export const OAuthConfirmPage = () => {
  onMount(async () => {
    const token = Cookie.get('token')
    setToken(token)
    window.close()
  })

  return <Loading />
}

export const Page = OAuthConfirmPage
