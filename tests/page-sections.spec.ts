// biome-ignore lint/correctness/noNodejsModules: <explanation>
import https from 'node:https'
import { type Page, expect, test } from '@playwright/test'

const baseHost = process.env.BASE_URL || 'https://localhost:3000'

/* Global starting test config */

let page: Page

function httpsGet(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          rejectUnauthorized: false // Ignore SSL certificate errors
        },
        (res) => {
          if (res.statusCode === 200) {
            resolve()
          } else {
            reject(new Error(`Request failed with status code ${res.statusCode}`))
          }
        }
      )
      .on('error', (error) => {
        reject(error)
      })
  })
}
async function waitForServer(url: string, timeout = 150000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await httpsGet(url)
      return true
    } catch (error) {
      // Ignore errors and try again
      console.log(`Error fetching ${url}: ${error}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Server at ${url} did not start within ${timeout} ms`)
}
test.beforeAll(async ({ browser }) => {
  console.log('Waiting for the server to start...')
  await new Promise((resolve) => setTimeout(resolve, 5000))
  const baseURL =  `${baseHost}`
  await waitForServer(baseURL)
  page = await browser.newPage()
  test.setTimeout(150000)
  await page.goto(baseURL)
  await expect(page).toHaveTitle(/Дискурс/)
  console.log('Localhost server started successfully!')
})
test.afterAll(async () => {
  await page.close()
})

/* TESTS section */

const pagesTitles = {
  '/': /Дискурс/,
  '/feed': /Лента/,
  '/guide/support': /Поддержите Дискурс/,
  '/author': /Авторы/,
  '/topic': /Темы и сюжеты/
}
test.describe('Pages open', () => {
  Object.keys(pagesTitles).forEach((res: string) => {
    test(`Open Page ${res}`, async ({ page }) => {
      await page.goto(`${res}`)
      const title = pagesTitles[res as keyof typeof pagesTitles] || ''
      await expect(page).toHaveTitle(title)
    })
  })
})
