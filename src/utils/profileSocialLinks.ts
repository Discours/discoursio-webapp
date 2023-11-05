type Link = {
  link: string
  rly: boolean
  name?: string
}

const links: Link[] = [
  { link: 'https://facebook/', name: 'facebook', rly: false },
  { link: 'https://linked.in/in/', name: 'linkedin', rly: false },
  { link: 'https://vk.com/', name: 'vk', rly: false },
  { link: 'https://instagram.com/', name: 'instagram', rly: false },
  { link: 'https://t.me/', name: 'telegram', rly: false }
]

const checkLink = (link: string, keyword: string): boolean => link.includes(keyword)
export const profileSocialLinks = (socialLinks: string[]): Link[] => {
  const processedLinks: Link[] = []
  let isMatched = false

  links.forEach((linkObj) => {
    let linkMatched = false

    socialLinks.forEach((serverLink) => {
      if (checkLink(serverLink, new URL(linkObj.link).hostname.replace('www.', ''))) {
        processedLinks.push({ ...linkObj, link: serverLink, rly: true })
        linkMatched = true
        isMatched = true
      }
    })
    if (!linkMatched) {
      processedLinks.push({ ...linkObj })
    }
  })
  if (!isMatched) {
    socialLinks.forEach((serverLink) => {
      processedLinks.push({ link: serverLink, rly: true })
    })
  }

  return processedLinks
}
