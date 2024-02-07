import type { JSX } from 'solid-js'

import { createBreakpoints } from '@solid-primitives/media'
import { createContext, useContext } from 'solid-js'

const breakpoints = {
  xs: '0',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
}

type MediaQueryContextType = {
  mediaMatches: ReturnType<typeof createBreakpoints>
}

const MediaQueryContext = createContext<MediaQueryContextType>()

export function useMediaQuery() {
  return useContext(MediaQueryContext)
}

export const MediaQueryProvider = (props: { children: JSX.Element }) => {
  const mediaMatches = createBreakpoints(breakpoints)

  const value: MediaQueryContextType = { mediaMatches }

  return <MediaQueryContext.Provider value={value}>{props.children}</MediaQueryContext.Provider>
}
