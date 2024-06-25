import { test, expect, type Page  } from '@playwright/test';
import https from 'https';


/* Global starting test config */

let page: Page;

function httpsGet(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      rejectUnauthorized: false // Ignore SSL certificate errors
    }, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`Request failed with status code ${res.statusCode}`));
      }
    }).on('error', (error) => {
      reject(error);
    });
  });
}
async function waitForServer(url: string, timeout: number = 150000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await httpsGet(url);
      return true;
    } catch (error) {
      // Ignore errors and try again
      console.log (`Error fetching ${url}: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server at ${url} did not start within ${timeout} ms`);
}
test.beforeAll(async ({ browser }) => {
    console.log('Waiting for the server to start...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const baseURL = 'https://localhost:3000';
    await waitForServer(baseURL);
    page = await browser.newPage();
    test.setTimeout(150000);
    await page.goto(baseURL);
    await expect(page).toHaveTitle(/Дискурс/);
    console.log('Localhost server started successfully!');
    await page.close();
  });
test.afterAll(async () => {
  await page.close();
  });


/* TESTS section */

test.beforeEach(async ({ page }) => {
  await page.goto(`/`);
  test.setTimeout(80000);
  await page.getByRole('link', { name: 'Войти' }).click();
  await page.getByPlaceholder('Почта').click();
  await page.getByPlaceholder('Почта').fill('guests@discours.io');
  await page.getByPlaceholder('Пароль').click();
  await page.getByPlaceholder('Пароль').fill('Gue$tP@ss');
  await page.getByRole('button', { name: 'Войти' }).click();
});

test.describe('*****Undone***** Drafts - article', () => {
  test('Open /create', async ({ page }) => {
    await page.goto(`/create`);
    await expect(page).toHaveTitle('Выберите тип публикации');
  });
});

/* test('Create article', async ({ page }) => {
  await page.goto(`/create`);
  await page.locator('li').filter({ hasText: 'статья' }).locator('img').click();
});

test('Check Draft', async ({ page }) => {
  
}); */

/* test('Drafts - create literature', async ({ page }) => {
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: /^литература$/ }).locator('img').click();
  Fill the form
  Save
  Check is it created
}); */

/* test('Drafts - create images', async ({ page }) => {
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: 'изображения' }).locator('img').click();
  Fill the form
  Save
  Check is it created
}); */

/* test('Drafts - create music', async ({ page }) => {
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: 'музыка' }).locator('img').click();
  Fill the form
  Save
  Check is it created
}); */

/* test('Drafts - create video', async ({ page }) => {
  await page.getByRole('button', { name: 'Т.Р' }).click();
  await page.getByRole('link', { name: 'Черновики' }).click();
  await page.getByRole('link', { name: 'Создать публикацию' }).click();
  await page.locator('li').filter({ hasText: 'видео' }).locator('img').click();
  Fill the form
  Save
  Check is it created
}); */


/* test('Post topic', async ({ page }) => {
  Open Draft
  Post
});*/