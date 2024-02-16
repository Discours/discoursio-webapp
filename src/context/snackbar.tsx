import type { Accessor, JSX } from 'solid-js'

import { createContext, createSignal, useContext } from 'solid-js'

import { delay } from '../utils/delay'

const DEFAULT_DURATION = 3000 // 3 sec

type SnackbarMessage = {
  type: 'success' | 'error'
  body: string | JSX.Element
  duration: number
}

type SnackbarContextType = {
  snackbarMessage: Accessor<SnackbarMessage>
  showSnackbar: (message: {
    type?: SnackbarMessage['type']
    body: SnackbarMessage['body']
    duration?: SnackbarMessage['duration']
  }) => Promise<void>
}

const SnackbarContext = createContext<SnackbarContextType>()

export function useSnackbar() {
  return useContext(SnackbarContext)
}

const messagesToShow: SnackbarMessage[] = []

let currentCheckMessagesPromise = null

export const SnackbarProvider = (props: { children: JSX.Element }) => {
  const [snackbarMessage, setSnackbarMessage] = createSignal<SnackbarMessage>(null)

  const checkMessages = async () => {
    if (messagesToShow.length === 0) {
      currentCheckMessagesPromise = null
      return
    }

    setSnackbarMessage(messagesToShow[0])
    await delay(messagesToShow[0].duration)
    setSnackbarMessage(null)
    await delay(1000)
    messagesToShow.shift()
    await checkMessages()
  }

  const showSnackbar = async (message: {
    type?: SnackbarMessage['type']
    body: SnackbarMessage['body']
    duration?: SnackbarMessage['duration']
  }): Promise<void> => {
    const messageToShow = {
      type: message.type ?? 'success',
      body: message.body,
      duration: message.duration ?? DEFAULT_DURATION
    }

    messagesToShow.push(messageToShow)

    if (!currentCheckMessagesPromise) {
      currentCheckMessagesPromise = checkMessages()
      await currentCheckMessagesPromise
    }

    return currentCheckMessagesPromise
  }

  const value: SnackbarContextType = { snackbarMessage, showSnackbar }

  return <SnackbarContext.Provider value={value}>{props.children}</SnackbarContext.Provider>
}
