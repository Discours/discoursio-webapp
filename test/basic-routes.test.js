// test/discoursio-webapp.check.js

const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()

  // Define the URLs to visit
  const pagesToVisit = [
    'http://localhost:3000/',
    'http://localhost:3000/feed',
    'http://localhost:3000/create',
    'http://localhost:3000/about/donate',
    'http://localhost:3000/authors',
    'http://localhost:3000/topics',
    'http://localhost:3000/inbox',
  ]

  // Loop through the pages and visit each one
  for (const pageUrl of pagesToVisit) {
    const page = await context.newPage()
    await page.goto(pageUrl)

    // Add your test assertions here if needed

    // Close the page before moving to the next one
    await page.close()
  }

  // Close the browser
  await browser.close()
})()
