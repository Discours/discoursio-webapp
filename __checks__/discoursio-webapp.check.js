const { chromium } = require('playwright')

const checkUrl = async (page, targetUrl, pageName) => {
  const response = await page.goto(targetUrl)
  if (response.status() > 399) {
    throw new Error(`Failed with response code ${response.status()}`)
  }

  await page.screenshot({ path: `${pageName}.jpg` })
}

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  const targetUrl = process.env.ENVIRONMENT_URL || 'https://testing.discours.io'

  await checkUrl(page, targetUrl, 'main')
  await checkUrl(page, `${targetUrl}/authors`, 'authors')
  await checkUrl(page, `${targetUrl}/topics`, 'topics')
  await page.close()
  await browser.close()
}

run()
