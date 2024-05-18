import { makePersisted } from '@solid-primitives/storage'
import { Accessor, JSX, createContext, createSignal, useContext } from 'solid-js'

type SeenContextType = {
  seen: Accessor<{ [slug: string]: number }>
  addSeen: (slug: string) => void
}

const SeenContext = createContext<SeenContextType>()
export function useSeen() {
  return useContext(SeenContext)
}

export const SeenProvider = (props: { children: JSX.Element }) => {
  const [seen, setSeen] = makePersisted(createSignal<{ [slug: string]: number }>({}), {
    name: 'discoursio-seen',
  })

  const addSeen = async (slug: string) => {
    setSeen((prev) => {
      const newSeen = { ...prev, [slug]: Date.now() }
      return newSeen
    })
  }

  const value: SeenContextType = { seen, addSeen }

  return <SeenContext.Provider value={value}>{props.children}</SeenContext.Provider>
}
