import { onMount } from 'solid-js'
import { Loading } from '../components/_shared/Loading'
import Cookie from 'js-cookie'

export const OAuthConfirmPage = () => {
  onMount(async () => {
    const token = Cookie.get('token')
    window.opener.postMessage(token)
  })

  return <Loading />
}

export const Page = OAuthConfirmPage
