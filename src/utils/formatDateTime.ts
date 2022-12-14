import { createMemo } from 'solid-js'
import { locale } from '../stores/ui'

// unix timestamp in seconds
const formattedTime = (time: number) =>
  createMemo<string>(() => {
    return new Date(time).toLocaleTimeString(locale(), {
      hour: 'numeric',
      minute: 'numeric'
    })
  })

export default formattedTime
