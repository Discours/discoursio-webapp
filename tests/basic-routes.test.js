import { chromium } from 'playwright'
;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()

  // Define the URLs to visit
  const pagesToVisit = [
    'https://localhost:3000/',
    'https://localhost:3000/feed',
    'https://localhost:3000/edit/new',
    'https://localhost:3000/guide/support',
    'https://localhost:3000/author',
    'https://localhost:3000/topic',
    'https://localhost:3000/inbox'
  ]

  // Loop through the pages and visit each one
  for (const pageUrl of pagesToVisit) {
    const page = await context.newPage()

    // Log a message before visiting the page
    console.log(`Visiting page: ${pageUrl}`)

    await page.goto(pageUrl)

    // Add your test assertions here if needed

    // Log a message after visiting the page
    console.log(`Finished visiting page: ${pageUrl}`)

    // Close the page before moving to the next one
    await page.close()
  }

  // Close the browser
  await browser.close()
})()
