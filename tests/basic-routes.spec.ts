import { expect, test } from '@playwright/test'

const pagesTitles = {
  'http://localhost:3000/': 'Дискурс',
  'http://localhost:3000/feed': 'Дискурс: лента',
  'http://localhost:3000/create': 'Дискурс',
  'http://localhost:3000/about/donate': 'Дискурс: поддержка',
  'http://localhost:3000/authors': 'Дискурс: авторы',
  'http://localhost:3000/topics': 'Дискурс: темы',
  'http://localhost:3000/inbox': 'Дискурс',
}

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Дискурс/)
})

test('check some links', async ({ page }) => {
  await page.goto('http://localhost:3000/feed')

  await expect(page).toHaveTitle(/Дискурс/)

  // Click the get started link.
  // await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  //await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
})
