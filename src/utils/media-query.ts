import { createBreakpoints, createMediaQuery } from '@solid-primitives/media'

export const breakpoints = {
  xs: '0',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
}
export const isMobile = createMediaQuery('(max-width: 767px)')
export const isDesktop = createMediaQuery('(min-width: 1200px)')
export const mediaMatches = createBreakpoints(breakpoints)
