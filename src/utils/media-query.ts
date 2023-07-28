import { createMediaQuery } from '@solid-primitives/media'

export const isMobile = createMediaQuery('(max-width: 767px)')
export const isDesktop = createMediaQuery('(min-width: 1200px)')
