import { expect, test } from '@playwright/test'

const baseHost = process.env.BASE_URL

const pagesTitles = {
  '/': /Дискурс/,
  '/feed': /Дискурс/,
  '/create': /Дискурс/,
  '/about/donate': /Дискурс/,
  '/authors': /Дискурс/,
  '/topics': /Дискурс/,
  '/inbox': /Дискурс/
}

Object.keys(pagesTitles).forEach((res: string) => {
  test(`страница ${res}`, async ({ page }) => {
    await page.goto(`${baseHost}${res}`)
    const title = pagesTitles[res]
    await expect(page).toHaveTitle(title)
  })
})
