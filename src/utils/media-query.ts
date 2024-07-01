import { createBreakpoints, createMediaQuery } from '@solid-primitives/media'

export const breakpoints = {
  xs: '0',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
}
export const isPortrait = createMediaQuery(`(max-width: ${breakpoints.sm})`)
export const isMobile = createMediaQuery(`(max-width: ${breakpoints.md})`)
export const isTablet = createMediaQuery(`(min-width: ${breakpoints.sm}, max-width: ${breakpoints.lg})`)
export const isDesktop = createMediaQuery(`(min-width: ${breakpoints.md}, max-width: ${breakpoints.xl})`)
export const isBig = createMediaQuery(`(min-width: ${breakpoints.xl})`)
export const mediaMatches = createBreakpoints(breakpoints)
