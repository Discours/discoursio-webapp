import { expect, test } from '@playwright/test'

const baseHost = process.env.BASE_HOST || 'https://localhost:3000'

const pagesTitles: { [key: string]: RegExp } = {
  '/': /Дискурс/,
  '/feed': /Лента/,
  '/edit/new': /Выберите тип публикации/,
  '/guide/support': /Поддержите Дискурс/,
  '/author': /Авторы/,
  '/topic': /Темы и сюжеты/,
  '/inbox': /Входящие/
}

Object.keys(pagesTitles).forEach((res: string) => {
  test(`страница ${res}`, async ({ page }) => {
    await page.goto(`${baseHost}${res}`)
    const title = pagesTitles[res]
    await expect(page).toHaveTitle(title)
  })
})
