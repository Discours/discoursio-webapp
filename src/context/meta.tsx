import {
  Component,
  JSX,
  ParentComponent,
  createContext,
  createRenderEffect,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js'
import { isServer, spread } from 'solid-js/web'

export const MetaContext = createContext<MetaContextType>()

interface TagDescription {
  tag: string
  props: Record<string, string>
  cleanup?: () => void
}

export interface MetaContextType {
  addTag: (tag: TagDescription) => void
  removeTag: (tag: TagDescription) => void
}

function initClientProvider() {
  const tags = new Map<string, TagDescription>()

  function addTag(tag: TagDescription) {
    const key = getTagKey(tag)
    tags.set(key, tag)

    const el = document.createElement(tag.tag)
    spread(el, tag.props)
    document.head.appendChild(el)

    tag.cleanup = () => {
      document.head.removeChild(el)
      tags.delete(key)
    }
  }

  function removeTag(tag: TagDescription) {
    const key = getTagKey(tag)
    const existingTag = tags.get(key)
    if (existingTag) {
      if (existingTag.cleanup) existingTag.cleanup()
      tags.delete(key)
    }
  }

  return { addTag, removeTag }
}

function initServerProvider() {
  const tags: TagDescription[] = []

  function addTag(tagDesc: TagDescription) {
    tags.push(tagDesc)
  }

  function removeTag(tag: TagDescription) {
    const index = tags.findIndex((t) => getTagKey(t) === getTagKey(tag))
    if (index !== -1) {
      tags.splice(index, 1)
    }
  }

  return { addTag, removeTag }
}

export const MetaProvider: ParentComponent = (props) => {
  const actions = isServer ? initServerProvider() : initClientProvider()
  const [tags, setTags] = createSignal<TagDescription[]>([])

  const addTag = (tag: TagDescription) => {
    actions.addTag(tag)
    setTags([...tags(), tag])
  }

  const removeTag = (tag: TagDescription) => {
    actions.removeTag(tag)
    setTags(tags().filter((t) => getTagKey(t) !== getTagKey(tag)))
  }

  onCleanup(() => {
    for (const tag of tags()) {
      tag.cleanup?.()
    }
  })

  return <MetaContext.Provider value={{ addTag, removeTag }}>{props.children}</MetaContext.Provider>
}

const getTagKey = (tag: TagDescription) => {
  const props = Object.entries(tag.props)
    .filter(([k]) => k !== 'children')
    .sort()

  return `${tag.tag}${JSON.stringify(props)}`
}

export function useHead(tagDesc: TagDescription) {
  const c = useContext(MetaContext)
  if (!c) throw new Error('<MetaProvider /> should be in the tree')

  createRenderEffect(() => {
    c.addTag(tagDesc)

    return () => {
      c.removeTag(tagDesc)
    }
  })
}

const MetaTag = (tag: string, props: Record<string, string>) => {
  useHead({ tag, props })

  return null
}

export const Title: Component<JSX.HTMLAttributes<HTMLTitleElement>> = (props) =>
  MetaTag('title', props as Record<string, string>)

export const Style: Component<JSX.StyleHTMLAttributes<HTMLStyleElement>> = (props) =>
  MetaTag('style', props as Record<string, string>)

export const Meta: Component<JSX.MetaHTMLAttributes<HTMLMetaElement>> = (props) =>
  MetaTag('meta', props as Record<string, string>)

export const Link: Component<JSX.LinkHTMLAttributes<HTMLLinkElement>> = (props) =>
  MetaTag('link', props as Record<string, string>)

export const Base: Component<JSX.BaseHTMLAttributes<HTMLBaseElement>> = (props) =>
  MetaTag('base', props as Record<string, string>)

export const Stylesheet: Component<Omit<JSX.LinkHTMLAttributes<HTMLLinkElement>, 'rel'>> = (props) => (
  <Link rel="stylesheet" {...props} />
)
