type Link = {
  link: string
  isPlaceholder: boolean
  name?: string
}

const links: Link[] = [
  { link: 'https://facebook.com/', name: 'facebook', isPlaceholder: true },
  { link: 'https://linkedin.com/', name: 'linkedin', isPlaceholder: true },
  { link: 'https://vk.com/', name: 'vk', isPlaceholder: true },
  { link: 'https://instagram.com/', name: 'instagram', isPlaceholder: true },
  { link: 'https://t.me/', name: 'telegram', isPlaceholder: true },
  { link: 'https://twitter.com/', name: 'twitter', isPlaceholder: true }
]

const checkLink = (link: string, keyword: string): boolean => link.includes(keyword)

export const profileSocialLinks = (socialLinks: string[]): Link[] => {
  const processedLinks: Link[] = []
  let unmatchedLinks: string[] = [...socialLinks]

  links.forEach((linkObj) => {
    let linkMatched = false

    socialLinks.forEach((serverLink) => {
      if (checkLink(serverLink, new URL(linkObj.link).hostname.replace('www.', ''))) {
        processedLinks.push({ ...linkObj, link: serverLink, isPlaceholder: false })
        linkMatched = true
        unmatchedLinks = unmatchedLinks.filter((unmatchedLink) => unmatchedLink !== serverLink)
      }
    })

    if (!linkMatched) {
      processedLinks.push({ ...linkObj, isPlaceholder: true })
    }
  })

  unmatchedLinks.forEach((unmatchedLink) => {
    processedLinks.push({ link: unmatchedLink, isPlaceholder: false })
  })

  return processedLinks.sort((a, b) => {
    if (a.isPlaceholder && !b.isPlaceholder) {
      return 1
    }
    if (!a.isPlaceholder && b.isPlaceholder) {
      return -1
    }
    return 0
  })
}
