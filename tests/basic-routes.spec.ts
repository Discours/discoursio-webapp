import { expect, test } from '@playwright/test'

const baseHost = process.env.BASE_HOST || 'https://localhost:3000'

const pagesTitles = {
  '/': /Дискурс/,
  '/feed': /Лента/,
  '/create': /Выберите тип публикации/,
  '/about/help': /Поддержите Дискурс/,
  '/authors': /Авторы/,
  '/topics': /Темы и сюжеты/,
  '/inbox': /Входящие/,
}

Object.keys(pagesTitles).forEach((res: string) => {
  test(`страница ${res}`, async ({ page }) => {
    await page.goto(`${baseHost}${res}`)
    const title = pagesTitles[res]
    await expect(page).toHaveTitle(title)
  })
})
