---
to: src/context/<%= h.changeCase.camel(name) %>.tsx
---
import type { Accessor, JSX } from 'solid-js'
import { createContext, createSignal, useContext } from 'solid-js'

type <%= h.changeCase.pascal(name) %>ContextType = {

}

const <%= h.changeCase.pascal(name) %>Context = createContext<<%= h.changeCase.pascal(name) %>ContextType>()

export function use<%= h.changeCase.pascal(name) %>() {
  return useContext(<%= h.changeCase.pascal(name) %>Context)
}

export const <%= h.changeCase.pascal(name) %>Provider = (props: { children: JSX.Element }) => {
  const actions = {
  }

  const value: <%= h.changeCase.pascal(name) %>ContextType = { ...actions }

  return <<%= h.changeCase.pascal(name) %>Context.Provider value={value}>{props.children}</<%= h.changeCase.pascal(name) %>Context.Provider>
}
